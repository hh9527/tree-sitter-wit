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
      $.item_world,
      $.item_interface,
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

    func_type: $ => seq(
      "func",
      $.input,
      "->",
      $.output,
    ),

    input: $ => $.args,
    output: $ => choice($.args, $.ty),
    
    item_func: $ => seq(
      field('name', $.ident),
      ':',
      $.func_type,
    ),
    
    method: $ => seq(optional("static"), $.item_func),
    resource_items: $ => seq("{", repeat($.method), "}"),
    item_resource: $ => seq(
      "resource",
      field("name", $.ident),
      optional($.resource_items),
    ),
    
    item_interface: $ => seq(
      'interface',
      $.ident,
      optional($.strlit),
      $.interface_items,
    ),
    
    item_world: $ => seq(
      'world',
      $.ident,
      world_items,
    ),
    
    world_items: $ => seq('{', repeat($.world_item), '}'),
    world_item: $ => seq(
      choice('export', 'import'),
      $.ident,
      ':',
      $.extern_type,
    ),
    
    extern_type: $ => choice(
      $.ty,
      $.func_type,
      $.interface_type,
    ),
    
    interface_type: $ => seq(
      'interface',
      $.interface_items,
    ),
    
    interface_items: $ => seq('{', repeat($.interface_item), '}'),
    
    interface_item: $ => choice(
      $.item_resource,
      $.item_variant,
      $.item_record,
      $.item_union,
      $.item_flags,
      $.item_enum,
      $.item_type,
      $.item_use,
      $.item_func,
    ),
  },
});

