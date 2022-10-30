(line_comment) @comment.line
(block_comment) @comment.block
(item_use from: (ident) @namespace)
(use_item name: (ident) @type)
(item_func name: (ident) @function)
(fields (named_ty name: (ident) @variable.other.member))
(input (args (named_ty name: (ident) @variable.parameter)))
(output (args (named_ty name: (ident) @variable.other.member)))
(flags (ident) @constant)
(enum_items (ident) @constant)
(variant_item tag: (ident) @type.enum.variant)
(ty (ident) @type)

[
  "u8" "u16" "u32" "u64"
  "s8" "s16" "s32" "s64"
  "float32" "float64"
  "char" "bool" "string"
  (unit)
] @type.builtin

"," @punctuation.delimiter
[ ":" "=" "->" ] @operator

[ "(" ")" "{" "}" "<" ">" ] @punctuation.bracket

[
  (star)
  "list"
  "option"
  "result"
  "tuple"
  "use"
  "as"
  "from"
  "type"
  "record"
  "flags"
  "variant"
  "enum"
  "union"
  "async"
  "func"
] @keyword
