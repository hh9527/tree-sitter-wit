/// <reference types="tree-sitter-cli/dsl" />

const csl = rule => optional(seq(
  rule,
  repeat(seq(",", rule)),
  optional(","),
));

module.exports = grammar({
  name: "wit",

  word: $ => $.ident,
  extras: $ => [$._whitespace, $.line_comment, $.block_comment],

  rules: {
    file: $ => repeat($.item),

    _whitespace: _ => /[ \n\r\t]/,
    line_comment: _ => /\/\/.*\n/,
    block_comment: _ => /\/\*([^*]|\*[^\/])*\*\//,
    ident: _ => /[a-z][0-9a-z]*(-[a-z][0-9a-z]*)*/,
    unit: _ => "_",
    star: _ => "*",
    ty: $ => choice(
      "u8",
      "u16",
      "u32",
      "u64",
      "s8",
      "s16",
      "s32",
      "s64",
      "float32",
      "float64",
      "char",
      "bool",
      "string",
      $.option,
      $.result,
      $.tuple,
      $.list,
      $.ident,
    ),

    item: $ => choice(
      $.item_use,
      $.item_type,
      $.item_record,
      $.item_flags,
      $.item_variant,
      $.item_enum,
      $.item_union,
      $.item_func,
    ),

    named_ty: $ => seq(field("name", $.ident), ":", field("ty", $.ty)),
    fields: $ => seq("{", csl($.named_ty), "}"),
    args: $ => seq("(", csl($.named_ty), ")"),

    option: $ => seq("option", "<", $.ty, ">"),
    tuple: $ => seq("tuple", "<", csl($.ty), ">"),
    list: $ => seq("list", "<", $.ty, ">"),
    result: $ => seq(
      "result",
      optional(seq(
        "<",
        choice($.ty, $.unit),
        optional(seq(",", $.ty)),
        ">"
      ))
    ),
    
    use_item: $ => seq(
      optional(seq(
        field("origin", $.ident),
        "as"
      )),
      field("name", $.ident)
    ),
    use_items: $ => seq("{", csl($.use_item), "}"),
    item_use: $ => seq(
      "use",
      choice($.star, $.use_items),
      "from",
      field("from", $.ident),
    ),

    item_type: $ => seq(
      "type",
      field("name", $.ident),
      "=",
      $.ty,
    ),

    item_record: $ => seq(
      "record",
      field("name", $.ident),
      $.fields,
    ),

    flags: $ => seq("{", csl($.ident), "}"),
    item_flags: $ => seq(
      "flags",
      field("name", $.ident),
      $.flags,
    ),

    variant_item: $ => seq(
      field("tag", $.ident),
      optional(seq("(", $.ty, ")"))
    ),
    variant_items: $ => seq("{", csl($.variant_item), "}"),
    item_variant: $ => seq(
      "variant",
      field("name", $.ident),
      $.variant_items,
    ),

    enum_items: $ => seq("{", csl($.ident), "}"),
    item_enum: $ => seq(
      "enum",
      field("name", $.ident),
      $.enum_items,
    ),

    union_items: $ => seq("{", csl($.ty), "}"),
    item_union: $ => seq(
      "union",
      field("name", $.ident),
      $.union_items,
    ),

    input: $ => $.args,
    output: $ => choice($.args, $.ty),
    item_func: $ => seq(
      field("name", $.ident),
      ":",
      optional("async"),
      "func",
      $.input,
      "->",
      $.output,
    ),
  },
});

