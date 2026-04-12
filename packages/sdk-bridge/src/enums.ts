// SDK selection element type constants
// Maps to Asc.c_oAscTypeSelectElement.* from the legacy SDK

export const SelectElementType = {
  Unknown: 0,
  Paragraph: 1,
  Image: 2,
  Table: 3,
  Shape: 4,
  Header: 5,
  Hyperlink: 6,
  Text: 7,
  Chart: 8,
} as const

export type SelectElementType = (typeof SelectElementType)[keyof typeof SelectElementType]
