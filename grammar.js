/// <reference types="tree-sitter-cli/dsl" />

const csl1 = rule => seq(
  rule,
  repeat(seq(",", rule)),
  optional(","),
);

const csl0 = rule => optional(csl1(rule));

module.exports = grammar({
  name: "wit",

  word: $ => $.ident,
  extras: $ => [$._whitespace, $.line_comment, $.block_comment],

  rules: {
    file: $ => repeat($.item),

    _whitespace: _ => /[ \n\r\t]/,
    line_comment: _ => /\/\/.*\n/,
    block_comment: _ => /\/\*([^*]|\*[^\/])*\*\//,
    ident: _ => /%?[a-z][0-9a-z]*(-[a-z][0-9a-z]*)*/,
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
      $.future,
      $.stream,
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
      $.item_resource,
      // $.item_interface,
    ),

    named_ty: $ => seq(field("name", $.ident), ":", field("ty", $.ty)),
    fields: $ => seq("{", csl0($.named_ty), "}"),
    args: $ => seq("(", csl0($.named_ty), ")"),
    tp1: $ => seq("<", $.ty, ">"),
    tp2: $ => seq(
      "<",
      choice(
        seq($.unit, ",", $.ty),
        seq($.ty, optional(seq(",", $.ty))),
      ),
      ">"
    ),
    tps: $ => seq("<", csl1($.ty), ">"),

    option: $ => seq("option", $.tp1),
    list: $ => seq("list", $.tp1),
    result: $ => seq("result", optional($.tp2)),
    tuple: $ => seq("tuple", $.tps),
    future: $ => seq("future", optional($.tp1)),
    stream: $ => seq("stream", optional($.tp2)),
    
    use_item: $ => seq(
      optional(seq(
        field("origin", $.ident),
        "as"
      )),
      field("name", $.ident)
    ),
    use_items: $ => seq("{", csl0($.use_item), "}"),
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

    flags: $ => seq("{", csl0($.ident), "}"),
    item_flags: $ => seq(
      "flags",
      field("name", $.ident),
      $.flags,
    ),

    variant_payload: $ => seq("(", $.ty, ")"),
    variant_item: $ => seq(
      field("tag", $.ident),
      optional($.variant_payload),
    ),
    variant_items: $ => seq("{", csl0($.variant_item), "}"),
    item_variant: $ => seq(
      "variant",
      field("name", $.ident),
      $.variant_items,
    ),

    enum_items: $ => seq("{", csl0($.ident), "}"),
    item_enum: $ => seq(
      "enum",
      field("name", $.ident),
      $.enum_items,
    ),

    union_items: $ => seq("{", csl0($.ty), "}"),
    item_union: $ => seq(
      "union",
      field("name", $.ident),
      $.union_items,
    ),

    _func: $ => seq(
      field("name", $.ident),
      ":",
      "func",
      $.input,
      "->",
      $.output,
    ),

    input: $ => $.args,
    output: $ => choice($.args, $.ty),
    item_func: $ => $._func,
    
    method: $ => seq(optional("static"), $._func),
    resource_items: $ => seq("{", repeat($.method), "}"),
    item_resource: $ => seq(
      "resource",
      field("name", $.ident),
      optional($.resource_items),
    ),
  },
});

