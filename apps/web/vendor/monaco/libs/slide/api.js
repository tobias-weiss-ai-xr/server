/**
 * Base class
 * @global
 * @class
 * @name ApiInterface
 */
var ApiInterface = () => {}
var Api = new ApiInterface()

/**
 * This element specifies the information which shall be used to establish a mapping to an XML element stored within a Custom XML.
 * @typedef {Object} XmlMapping
 * @property {string} prefixMapping The set of prefix mappings which shall be used to interpret the XPath expression specified in xpath.
 * @property {string} xpath The XPath expression.
 * @property {string} storeItemID The custom XML data identifier.
 * @example
 * {
 *   "prefixMapping": "xmlns:ns0='http://example.com/example'",
 *   "xpath": "//ns0:book",
 *   "storeItemID": "testXmlPart"
 * }
 */

/**
 * Class representing a bookmark in the document.
 * @constructor
 */
function ApiBookmark(startMark, endMark) {}

/**
 * Class representing a container for paragraphs and tables.
 * @param Document
 * @constructor
 */
function ApiDocumentContent(Document) {}

/**
 * Class representing a continuous region in a document.
 * Each Range object is determined by the position of the start and end characters.
 * @param oElement - The document element that may be Document, Table, Paragraph, Run or Hyperlink.
 * @param {Number} [Start = undefined] - The start element of Range in the current Element. If omitted or undefined, the range begins at the beginning of the element.
 * @param {Number} [End = undefined] - The end element of Range in the current Element. If omitted or undefined, the range begins at the end of the element.
 * @constructor
 */
function ApiRange(oElement, Start, End) {}
ApiRange.prototype.constructor = ApiRange

/**
 * Class representing the paragraph properties.
 * @constructor
 */
function ApiParaPr(Parent, ParaPr) {}

/**
 * Class representing a paragraph bullet.
 * @constructor
 */
function ApiBullet(Bullet) {}

/**
 * Class representing a paragraph.
 * @constructor
 * @extends {ApiParaPr}
 */
function ApiParagraph(Paragraph) {}
ApiParagraph.prototype = Object.create(ApiParaPr.prototype)
ApiParagraph.prototype.constructor = ApiParagraph

/**
 * Class representing the table properties.
 * @constructor
 */
function ApiTablePr(Parent, TablePr) {}

/**
 * Class representing the text properties.
 * @constructor
 */
function ApiTextPr(Parent, TextPr) {}

/**
 * Class representing a small text block called 'run'.
 * @constructor
 * @extends {ApiTextPr}
 */
function ApiRun(Run) {}
ApiRun.prototype = Object.create(ApiTextPr.prototype)
ApiRun.prototype.constructor = ApiRun

/**
 * Class representing a comment.
 * @constructor
 */
function ApiComment(oComment) {}

/**
 * Class representing a comment reply.
 * @constructor
 */
function ApiCommentReply(oParentComm, oCommentReply) {}

/**
 * Class representing a Paragraph hyperlink.
 * @constructor
 */
function ApiHyperlink(ParaHyperlink) {}
ApiHyperlink.prototype.constructor = ApiHyperlink

/**
 * Returns a type of the ApiHyperlink class.
 * @memberof ApiHyperlink
 * @returns {"hyperlink"}
 */
ApiHyperlink.prototype.GetClassType = () => ""

/**
 * Sets the hyperlink address.
 * @param {string} sLink - The hyperlink address.
 * @returns {boolean}
 */
ApiHyperlink.prototype.SetLink = (sLink) => true

/**
 * Sets the hyperlink display text.
 * @param {string} sDisplay - The text to display the hyperlink.
 * @returns {boolean}
 */
ApiHyperlink.prototype.SetDisplayedText = (sDisplay) => true

/**
 * Sets the screen tip text of the hyperlink.
 * @param {string} sScreenTipText - The screen tip text of the hyperlink.
 * @returns {boolean}
 */
ApiHyperlink.prototype.SetScreenTipText = (sScreenTipText) => true

/**
 * Returns the hyperlink address.
 * @returns {string}
 */
ApiHyperlink.prototype.GetLinkedText = () => ""

/**
 * Returns the hyperlink display text.
 * @returns {string}
 */
ApiHyperlink.prototype.GetDisplayedText = () => ""

/**
 * Returns the screen tip text of the hyperlink.
 * @returns {string}
 */
ApiHyperlink.prototype.GetScreenTipText = () => ""

/**
 * Returns the hyperlink element using the position specified.
 * @param {number} nPos - The position where the element which content we want to get must be located.
 * @returns {ParagraphContent}
 */
ApiHyperlink.prototype.GetElement = (nPos) => new ParagraphContent()

/**
 * Returns a number of elements in the current hyperlink.
 * @returns {number}
 */
ApiHyperlink.prototype.GetElementsCount = () => 0

/**
 * Sets the default hyperlink style.
 * @returns {boolean}
 */
ApiHyperlink.prototype.SetDefaultStyle = () => true

/**
 * Class representing a style.
 * @constructor
 */
function ApiStyle(Style) {}

/**
 * Class representing a document section.
 * @constructor
 */
function ApiSection(Section) {}

/**
 * Class representing the table row properties.
 * @constructor
 */
function ApiTableRowPr(Parent, RowPr) {}

/**
 * Class representing the table cell properties.
 * @constructor
 */
function ApiTableCellPr(Parent, CellPr) {}

/**
 * Class representing the numbering properties.
 * @constructor
 */
function ApiNumbering(Num) {}

/**
 * Class representing a reference to a specified level of the numbering.
 * @constructor
 */
function ApiNumberingLevel(Num, Lvl) {}

/**
 * Class representing a set of formatting properties which shall be conditionally applied to the parts of a table
 * which match the requirement specified on the <code>Type</code>.
 * @constructor
 */
function ApiTableStylePr(Type, Parent, TableStylePr) {}

/**
 * Class representing an unsupported element.
 * @constructor
 */
function ApiUnsupported() {}

/**
 * Class representing a chart.
 * @constructor
 *
 */
function ApiChart(Chart) {}
ApiChart.prototype = Object.create(ApiDrawing.prototype)
ApiChart.prototype.constructor = ApiChart

/**
 * Class representing shape geometry
 * @constructor
 */
function ApiGeometry(geometry) {}

/**
 * Class representing a path command
 * @constructor
 */
function ApiPathCommand(command) {}

/**
 * Class representing a path in geometry
 * @constructor
 */
function ApiPath(path) {}

/**
 * Class representing a chart series.
 * @constructor
 *
 */
function ApiChartSeries(oChartSpace, nIdx) {}

/**
 * Class representing a base class for color types.
 * @constructor
 */
function ApiUniColor(Unicolor) {}

/**
 * Class representing an RGB Color.
 * @constructor
 */
function ApiRGBColor(r, g, b) {}
ApiRGBColor.prototype = Object.create(ApiUniColor.prototype)
ApiRGBColor.prototype.constructor = ApiRGBColor

/**
 * Class representing a Scheme Color.
 * @constructor
 */
function ApiSchemeColor(sColorId) {}
ApiSchemeColor.prototype = Object.create(ApiUniColor.prototype)
ApiSchemeColor.prototype.constructor = ApiSchemeColor

/**
 * Class representing a Preset Color.
 * @constructor
 */
function ApiPresetColor(sPresetColor) {}
ApiPresetColor.prototype = Object.create(ApiUniColor.prototype)
ApiPresetColor.prototype.constructor = ApiPresetColor

/**
 * Class representing a base class for fill.
 * @constructor
 */
function ApiFill(UniFill) {}

/**
 * Class representing a stroke.
 * @constructor
 */
function ApiStroke(oLn) {}

/**
 * Class representing gradient stop.
 * @constructor
 */
function ApiGradientStop(oApiUniColor, pos) {}

/**
 * Class representing a container for the paragraph elements.
 * @constructor
 */
function ApiInlineLvlSdt(Sdt) {}

/**
 * Class representing a list of values of the combo box / drop-down list content control.
 * @constructor
 */
function ApiContentControlList(Parent) {}

/**
 * Class representing an entry of the combo box / drop-down list content control.
 * @constructor
 */
function ApiContentControlListEntry(Sdt, Parent, Text, Value) {}

/**
 * Class representing a container for the document content.
 * @constructor
 */
function ApiBlockLvlSdt(Sdt) {}

/**
 * Class representing the settings which are used to create a watermark.
 * @constructor
 */
function ApiWatermarkSettings(oSettings) {}

/**
 * Class representing document properties (similar to BuiltInDocumentProperties in VBA).
 * @constructor
 */
function ApiCore(oCore) {}

/**
 * Class representing custom properties of the document.
 * @constructor
 */
function ApiCustomProperties(oCustomProperties) {}

/**
 * Twentieths of a point (equivalent to 1/1440th of an inch).
 * @typedef {number} twips
 */

/**
 * Any valid element which can be added to the document structure.
 * @typedef {(ApiParagraph | ApiTable | ApiBlockLvlSdt)} DocumentElement
 */

/**
 * The style type used for the document element.
 * @typedef {("paragraph" | "table" | "run" | "numbering")} StyleType
 */

/**
 * 240ths of a line.
 * @typedef {number} line240
 */

/**
 * Half-points (2 half-points = 1 point).
 * @typedef {number} hps
 */

/**
 * A numeric value from 0 to 255.
 * @typedef {number} byte
 */

/**
 * 60000th of a degree (5400000 = 90 degrees).
 * @typedef {number} PositiveFixedAngle
 */

/**
 * A border type which will be added to the document element.
 * <b>"none"</b> - no border will be added to the created element or the selected element side.
 * <b>"single"</b> - a single border will be added to the created element or the selected element side.
 * @typedef {("none" | "single")} BorderType
 */

/**
 * A shade type which can be added to the document element.
 * @typedef {("nil" | "clear")} ShdType
 */

/**
 * Custom tab types.
 * @typedef {("clear" | "left" | "right" | "center")} TabJc
 */

/**
 * Eighths of a point (24 eighths of a point = 3 points).
 * @typedef {number} pt_8
 */

/**
 * A point.
 * @typedef {number} pt
 */

/**
 * Header and footer types which can be applied to the document sections.
 * <b>"default"</b> - a header or footer which can be applied to any default page.
 * <b>"title"</b> - a header or footer which is applied to the title page.
 * <b>"even"</b> - a header or footer which can be applied to even pages to distinguish them from the odd ones (which will be considered default).
 * @typedef {("default" | "title" | "even")} HdrFtrType
 */

/**
 * The possible values for the units of the width property are defined by a specific table or table cell width property.
 * <b>"auto"</b> - sets the table or table cell width to auto width.
 * <b>"twips"</b> - sets the table or table cell width to be measured in twentieths of a point.
 * <b>"nul"</b> - sets the table or table cell width to be of a zero value.
 * <b>"percent"</b> - sets the table or table cell width to be measured in percent to the parent container.
 * @typedef {("auto" | "twips" | "nul" | "percent")} TableWidth
 */

/**
 * This simple type specifies possible values for the table sections to which the current conditional formatting properties will be applied when this selected table style is used.
 * <b>"topLeftCell"</b> - specifies that the table formatting is applied to the top left cell.
 * <b>"topRightCell"</b> - specifies that the table formatting is applied to the top right cell.
 * <b>"bottomLeftCell"</b> - specifies that the table formatting is applied to the bottom left cell.
 * <b>"bottomRightCell"</b> - specifies that the table formatting is applied to the bottom right cell.
 * <b>"firstRow"</b> - specifies that the table formatting is applied to the first row.
 * <b>"lastRow"</b> - specifies that the table formatting is applied to the last row.
 * <b>"firstColumn"</b> - specifies that the table formatting is applied to the first column. Any subsequent row which is in *table header* ({@link ApiTableRowPr#SetTableHeader}) will also use this conditional format.
 * <b>"lastColumn"</b> - specifies that the table formatting is applied to the last column.
 * <b>"bandedColumn"</b> - specifies that the table formatting is applied to odd numbered groupings of rows.
 * <b>"bandedColumnEven"</b> - specifies that the table formatting is applied to even numbered groupings of rows.
 * <b>"bandedRow"</b> - specifies that the table formatting is applied to odd numbered groupings of columns.
 * <b>"bandedRowEven"</b> - specifies that the table formatting is applied to even numbered groupings of columns.
 * <b>"wholeTable"</b> - specifies that the conditional formatting is applied to the whole table.
 * @typedef {("topLeftCell" | "topRightCell" | "bottomLeftCell" | "bottomRightCell" | "firstRow" | "lastRow" |
 *     "firstColumn" | "lastColumn" | "bandedColumn" | "bandedColumnEven" | "bandedRow" | "bandedRowEven" |
 *     "wholeTable")} TableStyleOverrideType
 */

/**
 * The types of elements that can be added to the paragraph structure.
 * @typedef {(ApiUnsupported | ApiRun | ApiInlineLvlSdt | ApiHyperlink | ApiFormBase)} ParagraphContent
 */

/**
 * The types of elements that can be added to the paragraph structure.
 * @typedef {("ltr" | "rtl")} ReadingOrder
 */

/**
 * The possible values for the base which the relative horizontal positioning of an object will be calculated from.
 * @typedef {("character" | "column" | "leftMargin" | "rightMargin" | "margin" | "page")} RelFromH
 */

/**
 * The possible values for the base which the relative vertical positioning of an object will be calculated from.
 * @typedef {("bottomMargin" | "topMargin" | "margin" | "page" | "line" | "paragraph")} RelFromV
 */

/**
 * English measure unit. 1 mm = 36000 EMUs, 1 inch = 914400 EMUs.
 * @typedef {number} EMU
 */

/**
 * This type specifies the preset shape geometry that will be used for a shape.
 * @typedef {("accentBorderCallout1" | "accentBorderCallout2" | "accentBorderCallout3" | "accentCallout1" |
 *     "accentCallout2" | "accentCallout3" | "actionButtonBackPrevious" | "actionButtonBeginning" |
 *     "actionButtonBlank" | "actionButtonDocument" | "actionButtonEnd" | "actionButtonForwardNext" |
 *     "actionButtonHelp" | "actionButtonHome" | "actionButtonInformation" | "actionButtonMovie" |
 *     "actionButtonReturn" | "actionButtonSound" | "arc" | "bentArrow" | "bentConnector2" | "bentConnector3" |
 *     "bentConnector4" | "bentConnector5" | "bentUpArrow" | "bevel" | "blockArc" | "borderCallout1" |
 *     "borderCallout2" | "borderCallout3" | "bracePair" | "bracketPair" | "callout1" | "callout2" | "callout3" |
 *     "can" | "chartPlus" | "chartStar" | "chartX" | "chevron" | "chord" | "circularArrow" | "cloud" |
 *     "cloudCallout" | "corner" | "cornerTabs" | "cube" | "curvedConnector2" | "curvedConnector3" |
 *     "curvedConnector4" | "curvedConnector5" | "curvedDownArrow" | "curvedLeftArrow" | "curvedRightArrow" |
 *     "curvedUpArrow" | "decagon" | "diagStripe" | "diamond" | "dodecagon" | "donut" | "doubleWave" | "downArrow" | "downArrowCallout" | "ellipse" | "ellipseRibbon" | "ellipseRibbon2" | "flowChartAlternateProcess" | "flowChartCollate" | "flowChartConnector" | "flowChartDecision" | "flowChartDelay" | "flowChartDisplay" | "flowChartDocument" | "flowChartExtract" | "flowChartInputOutput" | "flowChartInternalStorage" | "flowChartMagneticDisk" | "flowChartMagneticDrum" | "flowChartMagneticTape" | "flowChartManualInput" | "flowChartManualOperation" | "flowChartMerge" | "flowChartMultidocument" | "flowChartOfflineStorage" | "flowChartOffpageConnector" | "flowChartOnlineStorage" | "flowChartOr" | "flowChartPredefinedProcess" | "flowChartPreparation" | "flowChartProcess" | "flowChartPunchedCard" | "flowChartPunchedTape" | "flowChartSort" | "flowChartSummingJunction" | "flowChartTerminator" | "foldedCorner" | "frame" | "funnel" | "gear6" | "gear9" | "halfFrame" | "heart" | "heptagon" | "hexagon" | "homePlate" | "horizontalScroll" | "irregularSeal1" | "irregularSeal2" | "leftArrow" | "leftArrowCallout" | "leftBrace" | "leftBracket" | "leftCircularArrow" | "leftRightArrow" | "leftRightArrowCallout" | "leftRightCircularArrow" | "leftRightRibbon" | "leftRightUpArrow" | "leftUpArrow" | "lightningBolt" | "line" | "lineInv" | "mathDivide" | "mathEqual" | "mathMinus" | "mathMultiply" | "mathNotEqual" | "mathPlus" | "moon" | "nonIsoscelesTrapezoid" | "noSmoking" | "notchedRightArrow" | "octagon" | "parallelogram" | "pentagon" | "pie" | "pieWedge" | "plaque" | "plaqueTabs" | "plus" | "quadArrow" | "quadArrowCallout" | "rect" | "ribbon" | "ribbon2" | "rightArrow" | "rightArrowCallout" | "rightBrace" | "rightBracket" | "round1Rect" | "round2DiagRect" | "round2SameRect" | "roundRect" | "rtTriangle" | "smileyFace" | "snip1Rect" | "snip2DiagRect" | "snip2SameRect" | "snipRoundRect" | "squareTabs" | "star10" | "star12" | "star16" | "star24" | "star32" | "star4" | "star5" | "star6" | "star7" | "star8" | "straightConnector1" | "stripedRightArrow" | "sun" | "swooshArrow" | "teardrop" | "trapezoid" | "triangle" | "upArrowCallout" | "upDownArrow" | "upDownArrow" | "upDownArrowCallout" | "uturnArrow" | "verticalScroll" | "wave" | "wedgeEllipseCallout" | "wedgeRectCallout" | "wedgeRoundRectCallout")} ShapeType
 */

/**
 * This type specifies the formula type that will be used for a geometry guide.
 * @typedef {("*\/" | "+-" | "+\/" | "?:" | "abs" | "at2" | "cat2" | "cos" | "max" | "min" | "mod" | "pin" | "sat2" | "sin" | "sqrt" | "tan" | "val")} GeometryFormulaType
 */

/**
 * This type specifies the available chart types which can be used to create a new chart.
 * @typedef {(
 *     "bar" | "barStacked" | "barStackedPercent" | "bar3D" | "barStacked3D" | "barStackedPercent3D" | "barStackedPercent3DPerspective" |
 *     "horizontalBar" | "horizontalBarStacked" | "horizontalBarStackedPercent" | "horizontalBar3D" | "horizontalBarStacked3D" | "horizontalBarStackedPercent3D" |
 *     "lineNormal" | "lineStacked" | "lineStackedPercent" | "lineNormalMarker" | "lineStackedMarker" | "lineStackedPerMarker" | "line3D" |
 *     "pie" | "pie3D" | "doughnut" |
 *     "scatter" | "scatterLine" | "scatterLineMarker" | "scatterSmooth" | "scatterSmoothMarker" |
 *     "stock" |
 *     "area" | "areaStacked" | "areaStackedPercent" |
 *     "comboCustom" | "comboBarLine" | "comboBarLineSecondary" |
 *     "radar" | "radarMarker" | "radarFilled" |
 *     "unknown"
 * )} ChartType
 */

/**
 * This type specifies the type of drawing lock.
 * @typedef {("noGrp" | "noUngrp" | "noSelect" | "noRot" | "noChangeAspect" | "noMove" | "noResize" | "noEditPoints" | "noAdjustHandles"
 * | "noChangeArrowheads" | "noChangeShapeType" | "noDrilldown" | "noTextEdit" | "noCrop" | "txBox")} DrawingLockType
 */

/**
 * Fill type for paths
 * @typedef {("none" | "norm" | "lighten" | "lightenLess" | "darken" | "darkenLess")} PathFillType
 */

/**
 * Path command types
 * @typedef {("moveTo" | "lineTo" | "bezier3" | "bezier4" | "arcTo" | "close")} PathCommandType
 */

/**
 * The available text vertical alignment (used to align text in a shape with a placement for text inside it).
 * @typedef {("top" | "center" | "bottom")} VerticalTextAlign
 */

/**
 * The available color scheme identifiers.
 * @typedef {("accent1" | "accent2" | "accent3" | "accent4" | "accent5" | "accent6" | "bg1" | "bg2" | "dk1" | "dk2"
 *     | "lt1" | "lt2" | "tx1" | "tx2")} SchemeColorId
 */

/**
 * The available preset color names.
 * @typedef {("aliceBlue" | "antiqueWhite" | "aqua" | "aquamarine" | "azure" | "beige" | "bisque" | "black" |
 *     "blanchedAlmond" | "blue" | "blueViolet" | "brown" | "burlyWood" | "cadetBlue" | "chartreuse" | "chocolate"
 *     | "coral" | "cornflowerBlue" | "cornsilk" | "crimson" | "cyan" | "darkBlue" | "darkCyan" | "darkGoldenrod" |
 *     "darkGray" | "darkGreen" | "darkGrey" | "darkKhaki" | "darkMagenta" | "darkOliveGreen" | "darkOrange" |
 *     "darkOrchid" | "darkRed" | "darkSalmon" | "darkSeaGreen" | "darkSlateBlue" | "darkSlateGray" |
 *     "darkSlateGrey" | "darkTurquoise" | "darkViolet" | "deepPink" | "deepSkyBlue" | "dimGray" | "dimGrey" |
 *     "dkBlue" | "dkCyan" | "dkGoldenrod" | "dkGray" | "dkGreen" | "dkGrey" | "dkKhaki" | "dkMagenta" |
 *     "dkOliveGreen" | "dkOrange" | "dkOrchid" | "dkRed" | "dkSalmon" | "dkSeaGreen" | "dkSlateBlue" |
 *     "dkSlateGray" | "dkSlateGrey" | "dkTurquoise" | "dkViolet" | "dodgerBlue" | "firebrick" | "floralWhite" |
 *     "forestGreen" | "fuchsia" | "gainsboro" | "ghostWhite" | "gold" | "goldenrod" | "gray" | "green" |
 *     "greenYellow" | "grey" | "honeydew" | "hotPink" | "indianRed" | "indigo" | "ivory" | "khaki" | "lavender" | "lavenderBlush" | "lawnGreen" | "lemonChiffon" | "lightBlue" | "lightCoral" | "lightCyan" | "lightGoldenrodYellow" | "lightGray" | "lightGreen" | "lightGrey" | "lightPink" | "lightSalmon" | "lightSeaGreen" | "lightSkyBlue" | "lightSlateGray" | "lightSlateGrey" | "lightSteelBlue" | "lightYellow" | "lime" | "limeGreen" | "linen" | "ltBlue" | "ltCoral" | "ltCyan" | "ltGoldenrodYellow" | "ltGray" | "ltGreen" | "ltGrey" | "ltPink" | "ltSalmon" | "ltSeaGreen" | "ltSkyBlue" | "ltSlateGray" | "ltSlateGrey" | "ltSteelBlue" | "ltYellow" | "magenta" | "maroon" | "medAquamarine" | "medBlue" | "mediumAquamarine" | "mediumBlue" | "mediumOrchid" | "mediumPurple" | "mediumSeaGreen" | "mediumSlateBlue" | "mediumSpringGreen" | "mediumTurquoise" | "mediumVioletRed" | "medOrchid" | "medPurple" | "medSeaGreen" | "medSlateBlue" | "medSpringGreen" | "medTurquoise" | "medVioletRed" | "midnightBlue" | "mintCream" | "mistyRose" | "moccasin" | "navajoWhite" | "navy" | "oldLace" | "olive" | "oliveDrab" | "orange" | "orangeRed" | "orchid" | "paleGoldenrod" | "paleGreen" | "paleTurquoise" | "paleVioletRed" | "papayaWhip" | "peachPuff" | "peru" | "pink" | "plum" | "powderBlue" | "purple" | "red" | "rosyBrown" | "royalBlue" | "saddleBrown" | "salmon" | "sandyBrown" | "seaGreen" | "seaShell" | "sienna" | "silver" | "skyBlue" | "slateBlue" | "slateGray" | "slateGrey" | "snow" | "springGreen" | "steelBlue" | "tan" | "teal" | "thistle" | "tomato" | "turquoise" | "violet" | "wheat" | "white" | "whiteSmoke" | "yellow" | "yellowGreen")} PresetColor
 */

/**
 * Possible values for the position of chart tick labels (either horizontal or vertical).
 * <b>"none"</b> - not display the selected tick labels.
 * <b>"nextTo"</b> - sets the position of the selected tick labels next to the main label.
 * <b>"low"</b> - sets the position of the selected tick labels in the part of the chart with lower values.
 * <b>"high"</b> - sets the position of the selected tick labels in the part of the chart with higher values.
 * @typedef {("none" | "nextTo" | "low" | "high")} TickLabelPosition
 */

/**
 * The type of a fill which uses an image as a background.
 * <b>"tile"</b> - if the image is smaller than the shape which is filled, the image will be tiled all over the created shape surface.
 * <b>"stretch"</b> - if the image is smaller than the shape which is filled, the image will be stretched to fit the created shape surface.
 * @typedef {"tile" | "stretch"} BlipFillType
 */

/**
 * The available preset patterns which can be used for the fill.
 * @typedef {"cross" | "dashDnDiag" | "dashHorz" | "dashUpDiag" | "dashVert" | "diagBrick" | "diagCross" | "divot"
 *     | "dkDnDiag" | "dkHorz" | "dkUpDiag" | "dkVert" | "dnDiag" | "dotDmnd" | "dotGrid" | "horz" | "horzBrick" |
 *     "lgCheck" | "lgConfetti" | "lgGrid" | "ltDnDiag" | "ltHorz" | "ltUpDiag" | "ltVert" | "narHorz" | "narVert"
 *     | "openDmnd" | "pct10" | "pct20" | "pct25" | "pct30" | "pct40" | "pct5" | "pct50" | "pct60" | "pct70" |
 *     "pct75" | "pct80" | "pct90" | "plaid" | "shingle" | "smCheck" | "smConfetti" | "smGrid" | "solidDmnd" |
 *     "sphere" | "trellis" | "upDiag" | "vert" | "wave" | "wdDnDiag" | "wdUpDiag" | "weave" | "zigZag"}
 *     PatternType
 */

/**
 *
 * The lock type of the content control.
 * @typedef {"unlocked" | "contentLocked" | "sdtContentLocked" | "sdtLocked"} SdtLock
 */

/**
 * Text transform type.
 * @typedef {("textArchDown" | "textArchDownPour" | "textArchUp" | "textArchUpPour" | "textButton" | "textButtonPour" | "textCanDown"
 * | "textCanUp" | "textCascadeDown" | "textCascadeUp" | "textChevron" | "textChevronInverted" | "textCircle" | "textCirclePour"
 * | "textCurveDown" | "textCurveUp" | "textDeflate" | "textDeflateBottom" | "textDeflateInflate" | "textDeflateInflateDeflate" | "textDeflateTop"
 * | "textDoubleWave1" | "textFadeDown" | "textFadeLeft" | "textFadeRight" | "textFadeUp" | "textInflate" | "textInflateBottom" | "textInflateTop"
 * | "textPlain" | "textRingInside" | "textRingOutside" | "textSlantDown" | "textSlantUp" | "textStop" | "textTriangle" | "textTriangleInverted"
 * | "textWave1" | "textWave2" | "textWave4" | "textNoShape")} TextTransform
 */

/**
 * Form type.
 * The available form types.
 * @typedef {"textForm" | "comboBoxForm" | "dropDownForm" | "checkBoxForm" | "radioButtonForm" | "pictureForm" | "complexForm"} FormType
 */

/**
 * 1 millimetre equals 1/10th of a centimetre.
 * @typedef {number} mm
 */

/**
 * The condition to scale an image in the picture form.
 * @typedef {"always" | "never" | "tooBig" | "tooSmall"} ScaleFlag
 */

/**
 * Value from 0 to 100.
 * @typedef {number} percentage
 */

/**
 * Available highlight colors.
 * @typedef {"black" | "blue" | "cyan" | "green" | "magenta" | "red" | "yellow" | "white" | "darkBlue" |
 * "darkCyan" | "darkGreen" | "darkMagenta" | "darkRed" | "darkYellow" | "darkGray" | "lightGray" | "none"} highlightColor
 */

/**
 * Available values of the "numbered" reference type:
 * <b>"pageNum"</b> - the numbered item page number;
 * <b>"paraNum"</b> - the numbered item paragraph number;
 * <b>"noCtxParaNum"</b> - the abbreviated paragraph number (the specific item only, e.g. instead of "4.1.1" you refer to "1" only);
 * <b>"fullCtxParaNum"</b> - the full paragraph number, e.g. "4.1.1";
 * <b>"text"</b> - the paragraph text value, e.g. if you have "4.1.1. Terms and Conditions", you refer to "Terms and Conditions" only;
 * <b>"aboveBelow"</b> - the words "above" or "below" depending on the item position.
 * @typedef {"pageNum" | "paraNum" | "noCtxParaNum" | "fullCtxParaNum" | "text" | "aboveBelow"} numberedRefTo
 */

/**
 * Available values of the "heading" reference type:
 * <b>"text"</b> - the entire heading text;
 * <b>"pageNum"</b> - the heading page number;
 * <b>"headingNum"</b> - the heading sequence number;
 * <b>"noCtxHeadingNum"</b> - the abbreviated heading number. Make sure the cursor pointer is in the section you are referencing to, e.g. you are in section 4 and you wish to refer to heading 4.B, so instead of "4.B" you receive "B" only;
 * <b>"fullCtxHeadingNum"</b> - the full heading number even if the cursor pointer is in the same section;
 * <b>"aboveBelow"</b> - the words "above" or "below" depending on the item position.
 * @typedef {"text" | "pageNum" | "headingNum" | "noCtxHeadingNum" | "fullCtxHeadingNum" | "aboveBelow"} headingRefTo
 */

/**
 * Available values of the "bookmark" reference type:
 * <b>"text"</b> - the entire bookmark text;
 * <b>"pageNum"</b> - the bookmark page number;
 * <b>"paraNum"</b> - the bookmark paragraph number;
 * <b>"noCtxParaNum"</b> - the abbreviated paragraph number (the specific item only, e.g. instead of "4.1.1" you refer to "1" only);
 * <b>"fullCtxParaNum</b> - the full paragraph number, e.g. "4.1.1";
 * <b>"aboveBelow"</b> - the words "above" or "below" depending on the item position.
 * @typedef {"text" | "pageNum" | "paraNum" | "noCtxParaNum" | "fullCtxParaNum" | "aboveBelow"} bookmarkRefTo
 */

/**
 * Available values of the "footnote" reference type:
 * <b>"footnoteNum"</b> - the footnote number;
 * <b>"pageNum"</b> - the page number of the footnote;
 * <b>"aboveBelow"</b> - the words "above" or "below" depending on the position of the item;
 * <b>"formFootnoteNum"</b> - the form number formatted as a footnote. The numbering of the actual footnotes is not affected.
 * @typedef {"footnoteNum" | "pageNum" | "aboveBelow" | "formFootnoteNum"} footnoteRefTo
 */

/**
 * Available values of the "endnote" reference type:
 * <b>"endnoteNum"</b> - the endnote number;
 * <b>"pageNum"</b> - the endnote page number;
 * <b>"aboveBelow"</b> - the words "above" or "below" depending on the item position;
 * <b>"formEndnoteNum"</b> - the form number formatted as an endnote. The numbering of the actual endnotes is not affected.
 * @typedef {"endnoteNum" | "pageNum" | "aboveBelow" | "formEndnoteNum"} endnoteRefTo
 */

/**
 * Available values of the "equation"/"figure"/"table" reference type:
 * <b>"entireCaption"</b>- the entire caption text;
 * <b>"labelNumber"</b> - the label and object number only, e.g. "Table 1.1";
 * <b>"captionText"</b> - the caption text only;
 * <b>"pageNum"</b> - the page number containing the referenced object;
 * <b>"aboveBelow"</b> - the words "above" or "below" depending on the item position.
 * @typedef {"entireCaption" | "labelNumber" | "captionText" | "pageNum" | "aboveBelow"} captionRefTo
 */

/**
 * Axis position in the chart.
 * @typedef {("top" | "bottom" | "right" | "left")} AxisPos
 */

/**
 * Standard numeric format.
 * @typedef {("General" | "0" | "0.00" | "#,##0" | "#,##0.00" | "0%" | "0.00%" |
 * "0.00E+00" | "# ?/?" | "# ??/??" | "m/d/yyyy" | "d-mmm-yy" | "d-mmm" | "mmm-yy" | "h:mm AM/PM" |
 * "h:mm:ss AM/PM" | "h:mm" | "h:mm:ss" | "m/d/yyyy h:mm" | "#,##0_\);(#,##0)" | "#,##0_\);\[Red\]\(#,##0)" |
 * "#,##0.00_\);\(#,##0.00\)" | "#,##0.00_\);\[Red\]\(#,##0.00\)" | "mm:ss" | "[h]:mm:ss" | "mm:ss.0" | "##0.0E+0" | "@")} NumFormat
 */

/**
 * Types of all supported forms.
 * @typedef {ApiTextForm | ApiComboBoxForm | ApiCheckBoxForm | ApiPictureForm | ApiDateForm | ApiComplexForm} ApiForm
 */

/**
 * Possible values for the caption numbering format.
 * <b>"ALPHABETIC"</b> - upper letter.
 * <b>"alphabetic"</b> - lower letter.
 * <b>"Roman"</b> - upper Roman.
 * <b>"roman"</b> - lower Roman.
 * <b>"Arabic"</b> - arabic.
 * @typedef {("ALPHABETIC" | "alphabetic" | "Roman" | "roman" | "Arabic")} CaptionNumberingFormat
 */

/**
 * Possible values for the caption separator.
 * <b>"hyphen"</b> - the "-" punctuation mark.
 * <b>"period"</b> - the "." punctuation mark.
 * <b>"colon"</b> - the ":" punctuation mark.
 * <b>"longDash"</b> - the "—" punctuation mark.
 * <b>"dash"</b> - the "-" punctuation mark.
 * @typedef {("hyphen" | "period" | "colon" | "longDash" | "dash")} CaptionSep
 */

/**
 * Possible values for the caption label.
 * @typedef {("Table" | "Equation" | "Figure")} CaptionLabel
 */

/**
 * Table of contents properties.
 * @typedef {Object} TocPr
 * @property {boolean} [ShowPageNums=true] - Specifies whether to show page numbers in the table of contents.
 * @property {boolean} [RightAlgn=true] - Specifies whether to right-align page numbers in the table of contents.
 * @property {TocLeader} [LeaderType="dot"] - The leader type in the table of contents.
 * @property {boolean} [FormatAsLinks=true] - Specifies whether to format the table of contents as links.
 * @property {TocBuildFromPr} [BuildFrom={OutlineLvls=9}] - Specifies whether to generate the table of contents from the outline levels or the specified styles.
 * @property {TocStyle} [TocStyle="standard"] - The table of contents style type.
 */

/**
 * Table of figures properties.
 * @typedef {Object} TofPr
 * @property {boolean} [ShowPageNums=true] - Specifies whether to show page numbers in the table of figures.
 * @property {boolean} [RightAlgn=true] - Specifies whether to right-align page numbers in the table of figures.
 * @property {TocLeader} [LeaderType="dot"] - The leader type in the table of figures.
 * @property {boolean} [FormatAsLinks=true] - Specifies whether to format the table of figures as links.
 * @property {CaptionLabel | string} [BuildFrom="Figure"] - Specifies whether to generate the table of figures based on the specified caption label or the paragraph style name used (for example, "Heading 1").
 * @property {boolean} [LabelNumber=true] - Specifies whether to include the label and number in the table of figures.
 * @property {TofStyle} [TofStyle="distinctive"] - The table of figures style type.
 */

/**
 * Table of contents properties which specify whether to generate the table of contents from the outline levels or the specified styles.
 * @typedef {Object} TocBuildFromPr
 * @property {number} [OutlineLvls=9] - Maximum number of levels in the table of contents.
 * @property {TocStyleLvl[]} StylesLvls - Style levels (for example, [{Name: "Heading 1", Lvl: 2}, {Name: "Heading 2", Lvl: 3}]).
 * <note>If StylesLvls.length > 0, then the OutlineLvls property will be ignored.</note>
 */

/**
 * Table of contents style levels.
 * @typedef {Object} TocStyleLvl
 * @property {string} Name - Style name (for example, "Heading 1").
 * @property {number} Lvl - Level which will be applied to the specified style in the table of contents.
 */

/**
 * Possible values for the table of contents leader:
 * <b>"dot"</b> - "......."
 * <b>"dash"</b> - "-------"
 * <b>"underline"</b> - "_______"
 * @typedef {("dot" | "dash" | "underline" | "none")} TocLeader
 */

/**
 * Possible values for the table of contents style.
 * @typedef {("simple" | "online" | "standard" | "modern" | "classic")} TocStyle
 */

/**
 * Possible values for the table of figures style.
 * @typedef {("simple" | "online" | "classic" | "distinctive" | "centered" | "formal")} TofStyle
 */

/**
 * Any valid drawing element.
 * @typedef {(ApiShape | ApiImage | ApiGroup | ApiOleObject | ApiChart )} Drawing
 */

/**
 * Available drawing element for grouping.
 * @typedef {(ApiShape | ApiGroup | ApiImage | ApiChart)} DrawingForGroup
 */

/**
 * The 1000th of a percent (100000 = 100%).
 * @typedef {number} PositivePercentage
 */

/**
 * The type of tick mark appearance.
 * @typedef {("cross" | "in" | "none" | "out")} TickMark
 */

/**
 * The watermark type.
 * @typedef {("none" | "text" | "image")} WatermarkType
 */

/**
 * The watermark direction.
 * @typedef {("horizontal" | "clockwise45" | "counterclockwise45" | "clockwise90" | "counterclockwise90")} WatermarkDirection
 */

/**
 * The Base64 image string.
 * @typedef {string} Base64Img
 * @example "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA..."
 */

/**
 * Creates a new smaller text block to be inserted to the current paragraph or table.
 * @memberof ApiInterface
 * @returns {ApiRun}
 */
ApiInterface.prototype.CreateRun = () => new ApiRun()

/**
 * Creates a new custom geometry
 * @memberof ApiInterface
 * @returns {ApiGeometry}
 */
ApiInterface.prototype.CreateCustomGeometry = () => new ApiGeometry()

/**
 * Creates a preset geometry
 * @memberof ApiInterface
 * @param {ShapeType} sPreset - Preset name
 * @returns {ApiGeometry | null}
 */
ApiInterface.prototype.CreatePresetGeometry = (sPreset) => new ApiGeometry()

/**
 * Creates an RGB color setting the appropriate values for the red, green and blue color components.
 * @memberof ApiInterface
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {ApiRGBColor}
 */
ApiInterface.prototype.CreateRGBColor = (r, g, b) => new ApiRGBColor()

/**
 * Creates a complex color scheme selecting from one of the available schemes.
 * @memberof ApiInterface
 * @param {SchemeColorId} schemeColorId - The color scheme identifier.
 * @returns {ApiSchemeColor}
 */
ApiInterface.prototype.CreateSchemeColor = (schemeColorId) => new ApiSchemeColor()

/**
 * Creates a color selecting it from one of the available color presets.
 * @memberof ApiInterface
 * @param {PresetColor} presetColor - A preset selected from the list of the available color preset names.
 * @returns {ApiPresetColor};
 */
ApiInterface.prototype.CreatePresetColor = (presetColor) => new ApiPresetColor()

/**
 * Creates a solid fill to apply to the object using a selected solid color as the object background.
 * @memberof ApiInterface
 * @param {ApiUniColor} uniColor - The color used for the element fill.
 * @returns {ApiFill}
 */
ApiInterface.prototype.CreateSolidFill = (uniColor) => new ApiFill()

/**
 * Creates a linear gradient fill to apply to the object using the selected linear gradient as the object background.
 * @memberof ApiInterface
 * @param {number[]} gradientStops - The array of gradient color stops measured in 1000th of percent.
 * @param {PositiveFixedAngle} angle - The angle measured in 60000th of a degree that will define the gradient direction.
 * @returns {ApiFill}
 */
ApiInterface.prototype.CreateLinearGradientFill = (gradientStops, angle) => new ApiFill()

/**
 * Creates a radial gradient fill to apply to the object using the selected radial gradient as the object background.
 * @memberof ApiInterface
 * @param {number[]} gradientStops - The array of gradient color stops measured in 1000th of percent.
 * @returns {ApiFill}
 */
ApiInterface.prototype.CreateRadialGradientFill = (gradientStops) => new ApiFill()

/**
 * Creates a pattern fill to apply to the object using the selected pattern as the object background.
 * @memberof ApiInterface
 * @param {PatternType} patternType - The pattern type used for the fill selected from one of the available pattern types.
 * @param {ApiUniColor} bgColor - The background color used for the pattern creation.
 * @param {ApiUniColor} fgColor - The foreground color used for the pattern creation.
 * @returns {ApiFill}
 */
ApiInterface.prototype.CreatePatternFill = (patternType, bgColor, fgColor) => new ApiFill()

/**
 * Creates a blip fill to apply to the object using the selected image as the object background.
 * @memberof ApiInterface
 * @param {string} imageUrl - The path to the image used for the blip fill (currently only internet URL or Base64 encoded images are supported).
 * @param {BlipFillType} blipFillType - The type of the fill used for the blip fill (tile or stretch).
 * @returns {ApiFill}
 */
ApiInterface.prototype.CreateBlipFill = (imageUrl, blipFillType) => new ApiFill()

/**
 * Creates no fill and removes the fill from the element.
 * @memberof ApiInterface
 * @returns {ApiFill}
 */
ApiInterface.prototype.CreateNoFill = () => new ApiFill()

/**
 * Creates a stroke adding shadows to the element.
 * @memberof ApiInterface
 * @param {EMU} width - The width of the shadow measured in English measure units.
 * @param {ApiFill} fill - The fill type used to create the shadow.
 * @returns {ApiStroke}
 */
ApiInterface.prototype.CreateStroke = (width, fill) => new ApiStroke()

/**
 * Creates a gradient stop used for different types of gradients.
 * @memberof ApiInterface
 * @param {ApiUniColor} uniColor - The color used for the gradient stop.
 * @param {PositivePercentage} pos - The position of the gradient stop measured in 1000th of percent.
 * @returns {ApiGradientStop}
 */
ApiInterface.prototype.CreateGradientStop = (uniColor, pos) => new ApiGradientStop()

/**
 * Creates a bullet for a paragraph with the character or symbol specified with the sSymbol parameter.
 * @memberof ApiInterface
 * @param {string} sSymbol - The character or symbol which will be used to create the bullet for the paragraph.
 * @returns {ApiBullet}
 */
ApiInterface.prototype.CreateBullet = (sSymbol) => new ApiBullet()

/**
 * Creates a bullet for a paragraph with the numbering character or symbol specified with the numType parameter.
 * @memberof ApiInterface
 * @param {BulletType} numType - The numbering type the paragraphs will be numbered with.
 * @param {number} startAt - The number the first numbered paragraph will start with.
 * @returns {ApiBullet}
 */
ApiInterface.prototype.CreateNumbering = (numType, startAt) => new ApiBullet()

/**
 * The checkbox content control properties
 * @typedef {Object} ContentControlCheckBoxPr
 * @property {boolean} [checked] Indicates whether the checkbox is checked by default.
 * @property {string} [checkedSymbol] A custom symbol to display when the checkbox is checked (e.g., "☒").
 * @property {string} [uncheckedSymbol] A custom symbol to display when the checkbox is unchecked (e.g., "☐").
 */

/**
 * The object representing the items in the combo box or drop-down list.
 * @typedef {Object} ContentControlListItem
 * @property {string} display - The text to be displayed in the combo box or drop-down list.
 * @property {string} value - The value associated with the item.
 */

/**
 * The date picker content control properties.
 * @typedef {Object} ContentControlDatePr
 * @property {string} format - The date format. Example: "mm.dd.yyyy".
 * @property {string} lang   - The date language. Possible value for this parameter is a language identifier as defined by
 * RFC 4646/BCP 47. Example: "en-CA".
 */

/**
 * Returns a type of the ApiUnsupported class.
 * @returns {"unsupported"}
 */
ApiUnsupported.prototype.GetClassType = () => ""

/**
 * Returns a type of the ApiDocumentContent class.
 * @memberof ApiDocumentContent
 * @returns {"documentContent"}
 */
ApiDocumentContent.prototype.GetClassType = () => ""

/**
 * Returns an internal ID of the current document content.
 * @memberof ApiDocumentContent
 * @returns {string}
 * @since 9.0.4
 */
ApiDocumentContent.prototype.GetInternalId = () => ""

/**
 * Returns a number of elements in the current document.
 * @memberof ApiDocumentContent
 * @returns {number}
 */
ApiDocumentContent.prototype.GetElementsCount = () => 0

/**
 * Returns an element by its position in the document.
 * @memberof ApiDocumentContent
 * @param {number} nPos - The element position that will be taken from the document.
 * @returns {DocumentElement}
 */
ApiDocumentContent.prototype.GetElement = (nPos) => new DocumentElement()

/**
 * Adds a paragraph or a table or a blockLvl content control using its position in the document content.
 * @memberof ApiDocumentContent
 * @param {number} nPos - The position where the current element will be added.
 * @param {DocumentElement} oElement - The document element which will be added at the current position.
 * @returns {boolean}
 */
ApiDocumentContent.prototype.AddElement = (nPos, oElement) => true

/**
 * Pushes a paragraph or a table to actually add it to the document.
 * @memberof ApiDocumentContent
 * @param {DocumentElement} oElement - The element type which will be pushed to the document.
 * @returns {boolean} - returns false if oElement is unsupported.
 */
ApiDocumentContent.prototype.Push = (oElement) => true

/**
 * Removes all the elements from the current document or from the current document element.
 * <note>When all elements are removed, a new empty paragraph is automatically created. If you want to add
 * content to this paragraph, use the {@link ApiDocumentContent#GetElement} method.</note>
 * @memberof ApiDocumentContent
 * @returns {boolean}
 */
ApiDocumentContent.prototype.RemoveAllElements = () => true

/**
 * Removes an element using the position specified.
 * @memberof ApiDocumentContent
 * @param {number} nPos - The element number (position) in the document or inside other element.
 * @returns {boolean}
 */
ApiDocumentContent.prototype.RemoveElement = (nPos) => true

/**
 * Class representing a custom XML manager, which provides methods to manage custom XML parts in the document.
 * @param doc - The current document.
 * @constructor
 */
function ApiCustomXmlParts(doc) {}
ApiCustomXmlParts.prototype = Object.create(ApiCustomXmlParts.prototype)
ApiCustomXmlParts.prototype.constructor = ApiCustomXmlParts

/**
 * Adds a new custom XML part to the XML manager.
 * @memberof ApiCustomXmlParts
 * @since 9.0.0
 * @param {string} xml - The XML string to be added.
 * @returns {ApiCustomXmlPart} The newly created ApiCustomXmlPart object.
 */
ApiCustomXmlParts.prototype.Add = (xml) => new ApiCustomXmlPart()

/**
 * Returns a type of the ApiCustomXmlParts class.
 * @memberof ApiCustomXmlParts
 * @returns {"customXmlParts"}
 */
ApiCustomXmlParts.prototype.GetClassType = () => ""

/**
 * Returns a custom XML part by its ID from the XML manager.
 * @memberof ApiCustomXmlParts
 * @since 9.0.0
 * @param {string} xmlPartId - The XML part ID.
 * @returns {ApiCustomXmlPart|null} The corresponding ApiCustomXmlPart object if found, or null if no match is found.
 */
ApiCustomXmlParts.prototype.GetById = (xmlPartId) => new ApiCustomXmlPart()

/**
 * Returns custom XML parts by namespace from the XML manager.
 * @memberof ApiCustomXmlParts
 * @since 9.0.0
 * @param {string} namespace - The namespace of the XML parts.
 * @returns {ApiCustomXmlPart[]} An array of ApiCustomXmlPart objects or null if no matching XML parts are found.
 */
ApiCustomXmlParts.prototype.GetByNamespace = (namespace) => [new ApiCustomXmlPart()]

/**
 * Returns a number of custom XML parts in the XML manager.
 * @memberof ApiCustomXmlParts
 * @since 9.0.0
 * @returns {number} The number of custom XML parts.
 */
ApiCustomXmlParts.prototype.GetCount = () => 0

/**
 * Returns all custom XML parts from the XML manager.
 * @memberof ApiCustomXmlParts
 * @since 9.0.0
 * @returns {ApiCustomXmlPart[]} An array of all custom XML parts.
 */
ApiCustomXmlParts.prototype.GetAll = () => [new ApiCustomXmlPart()]

/**
 * Class representing a custom XML part.
 * @constructor
 * @since 9.0.0
 * @param {Object} customXMl - The custom XML object.
 * @param {Object} customXmlManager - The custom XML manager instance.
 * @memberof ApiCustomXmlPart
 */
function ApiCustomXmlPart(customXMl, customXmlManager) {}
ApiCustomXmlPart.prototype = Object.create(ApiCustomXmlPart.prototype)
ApiCustomXmlPart.prototype.constructor = ApiCustomXmlPart

/**
 * Returns a type of the ApiCustomXmlPart class.
 * @memberof ApiCustomXmlPart
 * @returns {"customXmlPart"}
 */
ApiCustomXmlPart.prototype.GetClassType = () => ""

/**
 * Returns the ID of the custom XML part.
 * @memberof ApiCustomXmlPart
 * @returns {string}
 */
ApiCustomXmlPart.prototype.GetId = () => ""

/**
 * Retrieves nodes from custom XML based on the provided XPath.
 * @memberof ApiCustomXmlPart
 * @since 9.0.0
 * @param {string} xPath - The XPath expression to search for nodes.
 * @returns {ApiCustomXmlNode[]} An array of ApiCustomXmlNode objects corresponding to the found nodes.
 */
ApiCustomXmlPart.prototype.GetNodes = (xPath) => [new ApiCustomXmlNode()]

/**
 * Retrieves the XML string from the custom XML part.
 * @memberof ApiCustomXmlPart
 * @since 9.0.0
 * @returns {string} The XML string.
 */
ApiCustomXmlPart.prototype.GetXml = () => ""

/**
 * Deletes the XML from the custom XML manager.
 * @memberof ApiCustomXmlPart
 * @since 9.0.0
 * @returns {boolean} True if the XML was successfully deleted.
 */
ApiCustomXmlPart.prototype.Delete = () => true

/**
 * Deletes an attribute from the XML node at the specified XPath.
 * @memberof ApiCustomXmlPart
 * @since 9.0.0
 * @param {string} xPath - The XPath of the node from which to delete the attribute.
 * @param {string} name - The name of the attribute to delete.
 * @returns {boolean} True if the attribute was successfully deleted.
 */
ApiCustomXmlPart.prototype.DeleteAttribute = (xPath, name) => true

/**
 * Inserts an attribute into the XML node at the specified XPath.
 * @memberof ApiCustomXmlPart
 * @since 9.0.0
 * @param {string} xPath - The XPath of the node to insert the attribute into.
 * @param {string} name - The name of the attribute to insert.
 * @param {string} value - The value of the attribute to insert.
 * @returns {boolean} True if the attribute was successfully inserted.
 */
ApiCustomXmlPart.prototype.InsertAttribute = (xPath, name, value) => true

/**
 * Returns an attribute from the XML node at the specified XPath.
 * @memberof ApiCustomXmlPart
 * @since 9.0.0
 * @param {string} xPath - The XPath of the node from which to get the attribute.
 * @param {string} name - The name of the attribute to find.
 * @returns {string | null} The attribute value or null if no matching attributes are found.
 */
ApiCustomXmlPart.prototype.GetAttribute = (xPath, name) => ""

/**
 * Updates an attribute of the XML node at the specified XPath.
 * @memberof ApiCustomXmlPart
 * @since 9.0.0
 * @param {string} xPath - The XPath of the node whose attribute should be updated.
 * @param {string} name - The name of the attribute to update.
 * @param {string} value - The new value for the attribute.
 * @returns {boolean} True if the attribute was successfully updated.
 */
ApiCustomXmlPart.prototype.UpdateAttribute = (xPath, name, value) => true

/**
 * Deletes an XML element at the specified XPath.
 * @memberof ApiCustomXmlPart
 * @since 9.0.0
 * @param {string} xPath - The XPath of the node to delete.
 * @returns {boolean} True if the element was successfully deleted.
 */
ApiCustomXmlPart.prototype.DeleteElement = (xPath) => true

/**
 * Inserts an XML element at the specified XPath.
 * @memberof ApiCustomXmlPart
 * @since 9.0.0
 * @param {string} xPath - The XPath of the parent node where the new element will be inserted.
 * @param {string} xmlStr - The XML string to insert.
 * @param {number} [index] - The position at which to insert the new XML element. If omitted, the element will be appended as the last child.
 * @returns {boolean} True if the insertion was successful.
 */
ApiCustomXmlPart.prototype.InsertElement = (xPath, xmlStr, index) => true

/**
 * Updates an XML element at the specified XPath.
 * @memberof ApiCustomXmlPart
 * @since 9.0.0
 * @param {string} xPath - The XPath of the node to update.
 * @param {string} xmlStr - The XML string to replace the node content with.
 * @returns {boolean} True if the update was successful.
 */
ApiCustomXmlPart.prototype.UpdateElement = (xPath, xmlStr) => true

/**
 * Class representing a custom XML node.
 * @constructor
 * @since 9.0.0
 * @param xmlNode - The custom XML node.
 * @param xmlPart - The custom XML part.
 */
function ApiCustomXmlNode(xmlNode, xmlPart) {}
ApiCustomXmlNode.prototype = Object.create(ApiCustomXmlNode.prototype)
ApiCustomXmlNode.prototype.constructor = ApiCustomXmlNode

/**
 * Returns a type of the ApiCustomXmlNode class.
 * @memberof ApiCustomXmlNode
 * @returns {"customXmlNode"}
 */
ApiCustomXmlNode.prototype.GetClassType = () => ""

/**
 * Returns nodes from the custom XML node based on the given XPath.
 * @memberof ApiCustomXmlNode
 * @since 9.0.0
 * @param {string} xPath - The XPath expression to match nodes.
 * @returns {ApiCustomXmlNode[]} An array of nodes that match the given XPath.
 */
ApiCustomXmlNode.prototype.GetNodes = (xPath) => [new ApiCustomXmlNode()]

/**
 * Returns the absolute XPath of the current XML node.
 * @memberof ApiCustomXmlNode
 * @since 9.0.0
 * @returns {string} The absolute XPath of the current node.
 */
ApiCustomXmlNode.prototype.GetXPath = () => ""

/**
 * Returns the name of the current XML node.
 * @memberof ApiCustomXmlNode
 * @since 9.0.0
 * @returns {string} The name of the current node.
 */
ApiCustomXmlNode.prototype.GetNodeName = () => ""

/**
 * Returns the XML string representation of the current node content.
 * @memberof ApiCustomXmlNode
 * @since 9.0.0
 * @returns {string} The XML string representation of the current node content.
 */
ApiCustomXmlNode.prototype.GetNodeValue = () => ""

/**
 * Returns the XML string of the current node.
 * @memberof ApiCustomXmlNode
 * @since 9.0.0
 * @returns {string} The XML string representation of the current node.
 */
ApiCustomXmlNode.prototype.GetXml = () => ""

/**
 * Returns the inner text of the current node and its child nodes.
 * For example: `<text>123<one>4</one></text>` returns `"1234"`.
 * @memberof ApiCustomXmlNode
 * @since 9.0.0
 * @returns {string} The combined text content of the node and its descendants.
 */
ApiCustomXmlNode.prototype.GetText = () => ""

/**
 * Sets the XML content for the current node.
 * @memberof ApiCustomXmlNode
 * @since 9.0.0
 * @param {string} xml - The XML string to set as the content of the current node.
 * @returns {boolean} Returns `true` if the XML was successfully set.
 */
ApiCustomXmlNode.prototype.SetNodeValue = (xml) => true

/**
 * Sets the text content of the current XML node.
 * @memberof ApiCustomXmlNode
 * @since 9.0.0
 * @param {string} str - The text content to set for the node.
 * @returns {boolean} Returns `true` if the text was successfully set.
 */
ApiCustomXmlNode.prototype.SetText = (str) => true

/**
 * Sets the XML content of the current XML node.
 * @memberof ApiCustomXmlNode
 * @since 9.0.0
 * @param {string} strXml - The XML string to set as the node content.
 * @returns {boolean} Returns `true` if the XML was successfully set.
 */
ApiCustomXmlNode.prototype.SetXml = (strXml) => true

/**
 * Deletes the current XML node.
 * @memberof ApiCustomXmlNode
 * @since 9.0.0
 * @returns {boolean} Returns `true` if the node was successfully deleted.
 */
ApiCustomXmlNode.prototype.Delete = () => true

/**
 * Returns the parent of the current XML node.
 * @memberof ApiCustomXmlNode
 * @since 9.0.0
 * @returns {ApiCustomXmlNode | null} The parent node, or `null` if the current node has no parent.
 */
ApiCustomXmlNode.prototype.GetParent = () => new ApiCustomXmlNode()

/**
 * Creates a child node for the current XML node.
 * @memberof ApiCustomXmlNode
 * @since 9.0.0
 * @param {string} nodeName - The name of the new child node.
 * @returns {ApiCustomXmlNode} The newly created child node.
 */
ApiCustomXmlNode.prototype.Add = (nodeName) => new ApiCustomXmlNode()

/**
 * Represents an attribute of an XML node.
 * @typedef {Object} CustomXmlNodeAttribute
 * @property {string} name - The attribute name.
 * @property {string} value - The attribute value.
 */

/**
 * Returns a list of attributes of the current XML node.
 * @memberof ApiCustomXmlNode
 * @since 9.0.0
 * @returns {CustomXmlNodeAttribute[]} An array of attribute objects.
 */
ApiCustomXmlNode.prototype.GetAttributes = () => [new CustomXmlNodeAttribute()]

/**
 * Sets an attribute for the custom XML node.
 * If the attribute already exists, it will not be modified.
 * @memberof ApiCustomXmlNode
 * @since 9.0.0
 * @param {string} name - The name of the attribute to set.
 * @param {string} value - The value to assign to the attribute.
 * @returns {boolean} Returns `true` if the attribute was successfully set, `false` if the attribute already exists.
 */
ApiCustomXmlNode.prototype.SetAttribute = (name, value) => true

/**
 * Updates the value of an existing attribute in the custom XML node.
 * If the attribute doesn't exist, the update will not occur.
 * @memberof ApiCustomXmlNode
 * @since 9.0.0
 * @param {string} name - The name of the attribute to update.
 * @param {string} value - The new value to assign to the attribute.
 * @returns {boolean} Returns `true` if the attribute was successfully updated, `false` if the attribute doesn't exist.
 */
ApiCustomXmlNode.prototype.UpdateAttribute = (name, value) => true

/**
 * Deletes an attribute from the custom XML node.
 * If the attribute exists, it will be removed.
 * @memberof ApiCustomXmlNode
 * @since 9.0.0
 * @param {string} name - The name of the attribute to delete.
 * @returns {boolean} Returns `true` if the attribute was successfully deleted, `false` if the attribute didn't exist.
 */
ApiCustomXmlNode.prototype.DeleteAttribute = (name) => true

/**
 * Retrieves the attribute value from the custom XML node.
 * If the attribute doesn't exist, it returns `false`.
 * @memberof ApiCustomXmlNode
 * @since 9.0.0
 * @param {string} name - The name of the attribute to retrieve.
 * @returns {string |null} The value of the attribute if it exists, or `null` if the attribute is not found.
 */
ApiCustomXmlNode.prototype.GetAttribute = (name) => ""

/**
 * Represents a single comment record.
 * @typedef {Object} CommentReportRecord
 * @property {boolean} IsAnswer Specifies whether the comment is a response.
 * @property {string} CommentMessage The comment text.
 * @property {number} Date The comment local timestamp.
 * @property {number} DateUTC The  comment UTC timestamp.
 * @property {string} [QuoteText] The quoted text (if available).
 */

/**
 * Represents a user's comment history.
 * @typedef {Object} UserComments
 * @property {CommentReportRecord[]} comments A list of comments.
 */

/**
 * A dictionary of users and their comments.
 * @typedef {Object} CommentReport
 * @property {UserComments} [username] The comments grouped by username.
 * @example
 * {
 *   "John Smith": {
 *     comments: [
 *       { IsAnswer: false, CommentMessage: "Good text", Date: 1688588002698, DateUTC: 1688570002698, QuoteText: "Some text" },
 *       { IsAnswer: true, CommentMessage: "I don't think so", Date: 1688588012661, DateUTC: 1688570012661 }
 *     ]
 *   },
 *   "Mark Pottato": {
 *     comments: [
 *       { IsAnswer: false, CommentMessage: "Need to change this part", Date: 1688587967245, DateUTC: 1688569967245, QuoteText: "The quick brown fox jumps over the lazy dog" },
 *       { IsAnswer: false, CommentMessage: "We need to add a link", Date: 1688587967245, DateUTC: 1688569967245, QuoteText: "Word Office" }
 *     ]
 *   }
 * }
 */

/**
 * Review record type.
 * @typedef {("TextAdd" | "TextRem" | "ParaAdd" | "ParaRem" | "TextPr" | "ParaPr" | "Unknown")} ReviewReportRecordType
 */

/**
 * Represents a single review change record.
 * @typedef {Object} ReviewReportRecord
 * @property {ReviewReportRecordType} Type The review record type.
 * @property {string} [Value] The review change value (only for "TextAdd" and "TextRem" types).
 * @property {number} Date The timestamp of the change.
 * @property {ApiParagraph | ApiTable} ReviewedElement The element that was reviewed.
 */

/**
 * Represents a user's review history.
 * @typedef {Object} UserReviewChanges
 * @property {ReviewReportRecord[]} reviews A list of review records.
 */

/**
 * A dictionary of users and their review changes.
 * @typedef {Object} ReviewReport
 * @property {UserReviewChanges} [username] The review changes grouped by username.
 * @example
 * {
 *   "John Smith": {
 *     reviews: [
 *       { Type: "TextRem", Value: "Hello, Mark!", Date: 1679941734161, ReviewedElement: ApiParagraph },
 *       { Type: "TextAdd", Value: "Dear Mr. Pottato.", Date: 1679941736189, ReviewedElement: ApiParagraph }
 *     ]
 *   },
 *   "Mark Pottato": {
 *     reviews: [
 *       { Type: "ParaRem", Date: 1679941755942, ReviewedElement: ApiParagraph },
 *       { Type: "TextPr", Date: 1679941757832, ReviewedElement: ApiParagraph }
 *     ]
 *   }
 * }
 */

/**
 * The specific form type.
 * @typedef {("text" | "checkBox" | "picture" | "comboBox" | "dropDownList" | "dateTime" | "radio")} FormSpecificType
 */

/**
 * Form data.
 * @typedef {Object} FormData
 * @property {string} key - The form key. If the current form is a radio button, then this field contains the group key.
 * @property {string | boolean} value - The current field value.
 * @property {string} tag - The form tag.
 * @property {FormSpecificType} type - The form type.
 * @example
 * {
 *   "key" : "CompanyName",
 *   "tag" : "companyName",
 *   "value" : "Word Office",
 *   "type" : "text"
 * }
 */

/**
 * Returns a type of the ApiParagraph class.
 * @memberof ApiParagraph
 * @returns {"paragraph"}
 */
ApiParagraph.prototype.GetClassType = () => ""

/**
 * Adds some text to the current paragraph.
 * @memberof ApiParagraph
 * @param {string} [sText=""] - The text that we want to insert into the current document element.
 * @returns {ApiRun}
 */
ApiParagraph.prototype.AddText = (sText) => new ApiRun()

/**
 * Adds a line break to the current position and starts the next element from a new line.
 * @memberof ApiParagraph
 * @returns {ApiRun}
 */
ApiParagraph.prototype.AddLineBreak = () => new ApiRun()

/**
 * Returns the paragraph properties.
 * @memberof ApiParagraph
 * @returns {ApiParaPr}
 */
ApiParagraph.prototype.GetParaPr = () => new ApiParaPr()

/**
 * Returns a number of elements in the current paragraph.
 * @memberof ApiParagraph
 * @returns {number}
 */
ApiParagraph.prototype.GetElementsCount = () => 0

/**
 * Returns a paragraph element using the position specified.
 * @memberof ApiParagraph
 * @param {number} nPos - The position where the element which content we want to get must be located.
 * @returns {ParagraphContent}
 */
ApiParagraph.prototype.GetElement = (nPos) => new ParagraphContent()

/**
 * Removes an element using the position specified.
 * <note>If the element you remove is the last paragraph element (i.e. all the elements are removed from the paragraph),
 * a new empty run is automatically created. If you want to add
 * content to this run, use the {@link ApiParagraph#GetElement} method.</note>
 * @memberof ApiParagraph
 * @param {number} nPos - The element position which we want to remove from the paragraph.
 * @returns {boolean}
 */
ApiParagraph.prototype.RemoveElement = (nPos) => true

/**
 * Removes all the elements from the current paragraph.
 * <note>When all the elements are removed from the paragraph, a new empty run is automatically created. If you want to add
 * content to this run, use the {@link ApiParagraph#GetElement} method.</note>
 * @memberof ApiParagraph
 * @returns {boolean}
 */
ApiParagraph.prototype.RemoveAllElements = () => true

/**
 * Deletes the current paragraph.
 * @memberof ApiParagraph
 * @returns {boolean} - returns false if paragraph haven't parent.
 */
ApiParagraph.prototype.Delete = () => true

/**
 * Returns the next paragraph.
 * @memberof ApiParagraph
 * @returns {ApiParagraph | null} - returns null if paragraph is last.
 */
ApiParagraph.prototype.GetNext = () => new ApiParagraph()

/**
 * Returns the previous paragraph.
 * @memberof ApiParagraph
 * @returns {ApiParagraph} - returns null if paragraph is first.
 */
ApiParagraph.prototype.GetPrevious = () => new ApiParagraph()

/**
 * Creates a paragraph copy. Ingnore comments, footnote references, complex fields.
 * @memberof ApiParagraph
 * @returns {ApiParagraph}
 */
ApiParagraph.prototype.Copy = () => new ApiParagraph()

/**
 * Adds an element to the current paragraph.
 * @memberof ApiParagraph
 * @param {ParagraphContent} oElement - The document element which will be added at the current position. Returns false if the
 * oElement type is not supported by a paragraph.
 * @param {number} [nPos] - The position where the current element will be added. If this value is not
 * specified, then the element will be added at the end of the current paragraph.
 * @returns {boolean} Returns <code>false</code> if the type of <code>oElement</code> is not supported by paragraph
 * content.
 */
ApiParagraph.prototype.AddElement = (oElement, nPos) => true

/**
 * Adds a tab stop to the current paragraph.
 * @memberof ApiParagraph
 * @returns {ApiRun}
 */
ApiParagraph.prototype.AddTabStop = () => new ApiRun()

/**
 * Specifies a highlighting color which is applied as a background to the contents of the current paragraph.
 * @memberof ApiParagraph
 * @param {highlightColor} sColor - Available highlight color.
 * @returns {ApiParagraph} this
 */
ApiParagraph.prototype.SetHighlight = (sColor) => new ApiParagraph()

/**
 * Selects the current paragraph.
 * @memberof ApiParagraph
 * @returns {boolean}
 */
ApiParagraph.prototype.Select = () => true

/**
 * Returns a type of the ApiRun class.
 * @memberof ApiRun
 * @returns {"run"}
 */
ApiRun.prototype.GetClassType = () => ""

/**
 * Returns the text properties of the current run.
 * @memberof ApiRun
 * @returns {ApiTextPr}
 */
ApiRun.prototype.GetTextPr = () => new ApiTextPr()

/**
 * Clears the content from the current run.
 * @memberof ApiRun
 * @returns {boolean}
 */
ApiRun.prototype.ClearContent = () => true

/**
 * Removes all the elements from the current run.
 * @memberof ApiRun
 * @returns {boolean}
 */
ApiRun.prototype.RemoveAllElements = () => true

/**
 * Deletes the current run.
 * @memberof ApiRun
 * @returns {boolean}
 */
ApiRun.prototype.Delete = () => true

/**
 * Adds some text to the current run.
 * @memberof ApiRun
 * @param {string} sText - The text which will be added to the current run.
 * @returns {boolean}
 */
ApiRun.prototype.AddText = (sText) => true

/**
 * Adds a line break to the current run position and starts the next element from a new line.
 * @memberof ApiRun
 * @returns {boolean}
 */
ApiRun.prototype.AddLineBreak = () => true

/**
 * Adds a tab stop to the current run.
 * @memberof ApiRun
 * @returns {boolean}
 */
ApiRun.prototype.AddTabStop = () => true

/**
 * Creates a copy of the current run.
 * @memberof ApiRun
 * @returns {ApiRun}
 */
ApiRun.prototype.Copy = () => new ApiRun()

/**
 * Sets the text properties to the current run.
 * @memberof ApiRun
 * @param {ApiTextPr} oTextPr - The text properties that will be set to the current run.
 * @returns {ApiTextPr}
 */
ApiRun.prototype.SetTextPr = (oTextPr) => new ApiTextPr()

/**
 * Sets the bold property to the text character.
 * @memberof ApiRun
 * @param {boolean} isBold - Specifies that the contents of the current run are displayed bold.
 * @returns {ApiTextPr}
 */
ApiRun.prototype.SetBold = (isBold) => new ApiTextPr()

/**
 * Specifies that any lowercase characters in the current text run are formatted for display only as their capital letter character equivalents.
 * @memberof ApiRun
 * @param {boolean} isCaps - Specifies that the contents of the current run are displayed capitalized.
 * @returns {ApiTextPr}
 */
ApiRun.prototype.SetCaps = (isCaps) => new ApiTextPr()

/**
 * Sets the text color for the current text run in the RGB format.
 * @memberof ApiRun
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @param {boolean} [isAuto=false] - If this parameter is set to "true", then r,g,b parameters will be ignored.
 * @returns {ApiTextPr}
 */
ApiRun.prototype.SetColor = (r, g, b, isAuto) => new ApiTextPr()

/**
 * Specifies that the contents of the current run are displayed with two horizontal lines through each character displayed on the line.
 * @memberof ApiRun
 * @param {boolean} isDoubleStrikeout - Specifies that the contents of the current run are displayed double struck through.
 * @returns {ApiTextPr}
 */
ApiRun.prototype.SetDoubleStrikeout = (isDoubleStrikeout) => new ApiTextPr()

/**
 * Sets the text color to the current text run.
 * @memberof ApiRun
 * @param {ApiFill} oApiFill - The color or pattern used to fill the text color.
 * @returns {ApiTextPr}
 */
ApiRun.prototype.SetFill = (oApiFill) => new ApiTextPr()

/**
 * Sets all 4 font slots with the specified font family.
 * @memberof ApiRun
 * @param {string} sFontFamily - The font family or families used for the current text run.
 * @returns {ApiTextPr}
 */
ApiRun.prototype.SetFontFamily = (sFontFamily) => new ApiTextPr()

/**
 * Returns all font names from all elements inside the current run.
 * @memberof ApiRun
 * @returns {string[]} - The font names used for the current run.
 */
ApiRun.prototype.GetFontNames = () => [""]

/**
 * Sets the font size to the characters of the current text run.
 * @memberof ApiRun
 * @param {hps} nSize - The text size value measured in half-points (1/144 of an inch).
 * @returns {ApiTextPr}
 */
ApiRun.prototype.SetFontSize = (nSize) => new ApiTextPr()

/**
 * Specifies a highlighting color which is applied as a background to the contents of the current run.
 * @memberof ApiRun
 * @param {highlightColor} sColor - Available highlight color.
 * @returns {ApiTextPr}
 */
ApiRun.prototype.SetHighlight = (sColor) => new ApiTextPr()

/**
 * Sets the italic property to the text character.
 * @memberof ApiRun
 * @param {boolean} isItalic - Specifies that the contents of the current run are displayed italicized.
 * @returns {ApiTextPr}
 */
ApiRun.prototype.SetItalic = (isItalic) => new ApiTextPr()

/**
 * Specifies the languages which will be used to check spelling and grammar (if requested) when processing
 * the contents of this text run.
 * @memberof ApiRun
 * @param {string} sLangId - The possible value for this parameter is a language identifier as defined by
 * RFC 4646/BCP 47. Example: "en-CA".
 * @returns {ApiTextPr}
 */
ApiRun.prototype.SetLanguage = (sLangId) => new ApiTextPr()

/**
 * Specifies an amount by which text is raised or lowered for this run in relation to the default
 * baseline of the surrounding non-positioned text.
 * @memberof ApiRun
 * @param {hps} nPosition - Specifies a positive (raised text) or negative (lowered text)
 * measurement in half-points (1/144 of an inch).
 * @returns {ApiTextPr}
 */
ApiRun.prototype.SetPosition = (nPosition) => new ApiTextPr()

/**
 * Specifies the shading applied to the contents of the current text run.
 * @memberof ApiRun
 * @param {ShdType} sType - The shading type applied to the contents of the current text run.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 * @returns {ApiTextPr}
 */
ApiRun.prototype.SetShd = (sType, r, g, b) => new ApiTextPr()

/**
 * Specifies that all the small letter characters in this text run are formatted for display only as their capital
 * letter character equivalents which are two points smaller than the actual font size specified for this text.
 * @memberof ApiRun
 * @param {boolean} isSmallCaps - Specifies if the contents of the current run are displayed capitalized two points smaller or not.
 * @returns {ApiTextPr}
 */
ApiRun.prototype.SetSmallCaps = (isSmallCaps) => new ApiTextPr()

/**
 * Sets the text spacing measured in twentieths of a point.
 * @memberof ApiRun
 * @param {twips} nSpacing - The value of the text spacing measured in twentieths of a point (1/1440 of an inch).
 * @returns {ApiTextPr}
 */
ApiRun.prototype.SetSpacing = (nSpacing) => new ApiTextPr()

/**
 * Specifies that the contents of the current run are displayed with a single horizontal line through the center of the line.
 * @memberof ApiRun
 * @param {boolean} isStrikeout - Specifies that the contents of the current run are displayed struck through.
 * @returns {ApiTextPr}
 */
ApiRun.prototype.SetStrikeout = (isStrikeout) => new ApiTextPr()

/**
 * Specifies that the contents of the current run are displayed along with a line appearing directly below the character
 * (less than all the spacing above and below the characters on the line).
 * @memberof ApiRun
 * @param {boolean} isUnderline - Specifies that the contents of the current run are displayed underlined.
 * @returns {ApiTextPr}
 */
ApiRun.prototype.SetUnderline = (isUnderline) => new ApiTextPr()

/**
 * Specifies the alignment which will be applied to the contents of the current run in relation to the default appearance of the text run:
 * <b>"baseline"</b> - the characters in the current text run will be aligned by the default text baseline.
 * <b>"subscript"</b> - the characters in the current text run will be aligned below the default text baseline.
 * <b>"superscript"</b> - the characters in the current text run will be aligned above the default text baseline.
 * @memberof ApiRun
 * @param {("baseline" | "subscript" | "superscript")} sType - The vertical alignment type applied to the text contents.
 * @returns {ApiTextPr}
 */
ApiRun.prototype.SetVertAlign = (sType) => new ApiTextPr()

/**
 * The section break type which defines how the contents of the current section are placed relative to the previous section.
 * WordprocessingML supports five distinct types of section breaks:
 * <b>Next page</b> ("nextPage") - starts a new section on the next page (the default value).
 * <b>Odd</b> ("oddPage") - starts a new section on the next odd-numbered page.
 * <b>Even</b> ("evenPage") - starts a new section on the next even-numbered page.
 * <b>Continuous</b> ("continuous") - starts a new section in the next paragraph.
 * This means that continuous section breaks might not specify certain page-level section properties,
 * since they shall be inherited from the following section.
 * However, these breaks can specify other section properties, such as line numbering and footnote/endnote settings.
 * <b>Column</b> ("nextColumn") - starts a new section in the next column on the page.
 * @typedef {("nextPage" | "oddPage" | "evenPage" | "continuous" | "nextColumn")} SectionBreakType
 */

/**
 * Coordinate value for geometry paths.
 * Can be a guide name from gdLst, a numeric value, or a string representation of a number.
 * @typedef {string | number} GeometryCoordinate
 */

/**
 * Returns a type of the ApiTextPr class.
 * @memberof ApiTextPr
 * @returns {"textPr"}
 */
ApiTextPr.prototype.GetClassType = () => ""

/**
 * Sets the bold property to the text character.
 * @memberof ApiTextPr
 * @param {boolean} isBold - Specifies that the contents of the run are displayed bold.
 * @returns {ApiTextPr} - this text properties.
 */
ApiTextPr.prototype.SetBold = (isBold) => new ApiTextPr()

/**
 * Gets the bold property from the current text properties.
 * @memberof ApiTextPr
 * @returns {boolean}
 * @since 8.1.0
 */
ApiTextPr.prototype.GetBold = () => true

/**
 * Sets the italic property to the text character.
 * @memberof ApiTextPr
 * @param {boolean} isItalic - Specifies that the contents of the current run are displayed italicized.
 * @returns {ApiTextPr} - this text properties.
 */
ApiTextPr.prototype.SetItalic = (isItalic) => new ApiTextPr()

/**
 * Gets the italic property from the current text properties.
 * @memberof ApiTextPr
 * @returns {boolean}
 * @since 8.1.0
 */
ApiTextPr.prototype.GetItalic = () => true

/**
 * Specifies that the contents of the run are displayed with a single horizontal line through the center of the line.
 * @memberof ApiTextPr
 * @param {boolean} isStrikeout - Specifies that the contents of the current run are displayed struck through.
 * @returns {ApiTextPr} - this text properties.
 */
ApiTextPr.prototype.SetStrikeout = (isStrikeout) => new ApiTextPr()

/**
 * Gets the strikeout property from the current text properties.
 * @memberof ApiTextPr
 * @returns {boolean}
 * @since 8.1.0
 */
ApiTextPr.prototype.GetStrikeout = () => true

/**
 * Specifies that the contents of the run are displayed along with a line appearing directly below the character
 * (less than all the spacing above and below the characters on the line).
 * @memberof ApiTextPr
 * @param {boolean} isUnderline - Specifies that the contents of the current run are displayed underlined.
 * @returns {ApiTextPr} - this text properties.
 */
ApiTextPr.prototype.SetUnderline = (isUnderline) => new ApiTextPr()

/**
 * Gets the underline property from the current text properties.
 * @memberof ApiTextPr
 * @returns {boolean}
 * @since 8.1.0
 */
ApiTextPr.prototype.GetUnderline = () => true

/**
 * Sets all 4 font slots with the specified font family.
 * @memberof ApiTextPr
 * @param {string} sFontFamily - The font family or families used for the current text run.
 * @returns {ApiTextPr} - this text properties.
 */
ApiTextPr.prototype.SetFontFamily = (sFontFamily) => new ApiTextPr()

/**
 * Returns the font family from the current text properties.
 * The method automatically calculates the font from the theme if the font was set via the theme.
 * @memberof ApiTextPr
 * param {undefined | "ascii" | "eastAsia" | "hAnsi" | "cs"} [fontSlot="ascii"] - The font slot.
 * If this parameter is not specified, the "ascii" value is used.
 * @returns {string}
 * @since 8.1.0
 */
ApiTextPr.prototype.GetFontFamily = (fontSlot) => ""

/**
 * Sets the font size to the characters of the current text run.
 * @memberof ApiTextPr
 * @param {hps} nSize - The text size value measured in half-points (1/144 of an inch).
 * @returns {ApiTextPr} - this text properties.
 */
ApiTextPr.prototype.SetFontSize = (nSize) => new ApiTextPr()

/**
 * Gets the font size from the current text properties.
 * @memberof ApiTextPr
 * @returns {hps}
 * @since 8.1.0
 */
ApiTextPr.prototype.GetFontSize = () => new hps()

/**
 * Specifies the alignment which will be applied to the contents of the run in relation to the default appearance of the run text:
 * <b>"baseline"</b> - the characters in the current text run will be aligned by the default text baseline.
 * <b>"subscript"</b> - the characters in the current text run will be aligned below the default text baseline.
 * <b>"superscript"</b> - the characters in the current text run will be aligned above the default text baseline.
 * @memberof ApiTextPr
 * @param {("baseline" | "subscript" | "superscript")} sType - The vertical alignment type applied to the text contents.
 * @returns {ApiTextPr} - this text properties.
 */
ApiTextPr.prototype.SetVertAlign = (sType) => new ApiTextPr()

/**
 * Specifies a highlighting color which is added to the text properties and applied as a background to the contents of the current run/range/paragraph.
 * @memberof ApiTextPr
 * @param {highlightColor} sColor - Available highlight color.
 * @returns {ApiTextPr}
 */
ApiTextPr.prototype.SetHighlight = (sColor) => new ApiTextPr()

/**
 * Gets the highlight property from the current text properties.
 * @memberof ApiTextPr
 * @returns {string}
 * @since 8.1.0
 */
ApiTextPr.prototype.GetHighlight = () => ""

/**
 * Sets the text spacing measured in twentieths of a point.
 * @memberof ApiTextPr
 * @param {twips} nSpacing - The value of the text spacing measured in twentieths of a point (1/1440 of an inch).
 * @returns {ApiTextPr} - this text properties.
 */
ApiTextPr.prototype.SetSpacing = (nSpacing) => new ApiTextPr()

/**
 * Gets the text spacing from the current text properties measured in twentieths of a point.
 * @memberof ApiTextPr
 * @returns {twips}
 * @since 8.1.0
 */
ApiTextPr.prototype.GetSpacing = () => new twips()

/**
 * Specifies that the contents of the run are displayed with two horizontal lines through each character displayed on the line.
 * @memberof ApiTextPr
 * @param {boolean} isDoubleStrikeout - Specifies that the contents of the current run are displayed double struck through.
 * @returns {ApiTextPr} - this text properties.
 */
ApiTextPr.prototype.SetDoubleStrikeout = (isDoubleStrikeout) => new ApiTextPr()

/**
 * Gets the double strikeout property from the current text properties.
 * @memberof ApiTextPr
 * @returns {boolean}
 * @since 8.1.0
 */
ApiTextPr.prototype.GetDoubleStrikeout = () => true

/**
 * Specifies that any lowercase characters in the text run are formatted for display only as their capital letter character equivalents.
 * @memberof ApiTextPr
 * @param {boolean} isCaps - Specifies that the contents of the current run are displayed capitalized.
 * @returns {ApiTextPr} - this text properties.
 */
ApiTextPr.prototype.SetCaps = (isCaps) => new ApiTextPr()

/**
 * Specifies whether the text with the current text properties are capitalized.
 * @memberof ApiTextPr
 * @returns {boolean}
 * @since 8.1.0
 */
ApiTextPr.prototype.GetCaps = () => true

/**
 * Specifies that all the small letter characters in the text run are formatted for display only as their capital
 * letter character equivalents which are two points smaller than the actual font size specified for this text.
 * @memberof ApiTextPr
 * @param {boolean} isSmallCaps - Specifies if the contents of the current run are displayed capitalized two points smaller or not.
 * @returns {ApiTextPr} - this text properties.
 */
ApiTextPr.prototype.SetSmallCaps = (isSmallCaps) => new ApiTextPr()

/**
 * Specifies whether the text with the current text properties are displayed capitalized two points smaller than the actual font size.
 * @memberof ApiTextPr
 * @returns {boolean}
 * @since 8.1.0
 */
ApiTextPr.prototype.GetSmallCaps = () => true

/**
 * Sets the text color to the current text run.
 * @memberof ApiTextPr
 * @param {ApiFill} oApiFill - The color or pattern used to fill the text color.
 * @returns {ApiTextPr} - this text properties.
 */
ApiTextPr.prototype.SetFill = (oApiFill) => new ApiTextPr()

/**
 * Gets the text color from the current text properties.
 * @memberof ApiTextPr
 * @returns {ApiFill}
 * @since 8.1.0
 */
ApiTextPr.prototype.GetFill = () => new ApiFill()

/**
 * Sets the text fill to the current text run.
 * @memberof ApiTextPr
 * @param {ApiFill} oApiFill - The color or pattern used to fill the text color.
 * @returns {ApiTextPr} - this text properties.
 */
ApiTextPr.prototype.SetTextFill = (oApiFill) => new ApiTextPr()

/**
 * Gets the text fill from the current text properties.
 * @memberof ApiTextPr
 * @returns {ApiFill}
 * @since 8.1.0
 */
ApiTextPr.prototype.GetTextFill = () => new ApiFill()

/**
 * Sets the text outline to the current text run.
 * @memberof ApiTextPr
 * @param {ApiStroke} oStroke - The stroke used to create the text outline.
 * @returns {ApiTextPr} - this text properties.
 */
ApiTextPr.prototype.SetOutLine = (oStroke) => new ApiTextPr()

/**
 * Gets the text outline from the current text properties.
 * @memberof ApiTextPr
 * @returns {ApiStroke}
 * @since 8.1.0
 */
ApiTextPr.prototype.GetOutLine = () => new ApiStroke()

/**
 * Returns a type of the ApiParaPr class.
 * @memberof ApiParaPr
 * @returns {"paraPr"}
 */
ApiParaPr.prototype.GetClassType = () => ""

/**
 * Sets the paragraph left side indentation.
 * @memberof ApiParaPr
 * @param {twips} nValue - The paragraph left side indentation value measured in twentieths of a point (1/1440 of an inch).
 * @returns {boolean}
 */
ApiParaPr.prototype.SetIndLeft = (nValue) => true

/**
 * Returns the paragraph left side indentation.
 * @memberof ApiParaPr
 * @returns {twips | undefined} - The paragraph left side indentation value measured in twentieths of a point (1/1440 of an inch).
 */
ApiParaPr.prototype.GetIndLeft = () => new twips()

/**
 * Sets the paragraph right side indentation.
 * @memberof ApiParaPr
 * @param {twips} nValue - The paragraph right side indentation value measured in twentieths of a point (1/1440 of an inch).
 * @returns {boolean}
 */
ApiParaPr.prototype.SetIndRight = (nValue) => true

/**
 * Returns the paragraph right side indentation.
 * @memberof ApiParaPr
 * @returns {twips | undefined} - The paragraph right side indentation value measured in twentieths of a point (1/1440 of an inch).
 */
ApiParaPr.prototype.GetIndRight = () => new twips()

/**
 * Sets the paragraph first line indentation.
 * @memberof ApiParaPr
 * @param {twips} nValue - The paragraph first line indentation value measured in twentieths of a point (1/1440 of an inch).
 * @returns {boolean}
 */
ApiParaPr.prototype.SetIndFirstLine = (nValue) => true

/**
 * Returns the paragraph first line indentation.
 * @memberof ApiParaPr
 * @returns {twips | undefined} - The paragraph first line indentation value measured in twentieths of a point (1/1440 of an inch).
 */
ApiParaPr.prototype.GetIndFirstLine = () => new twips()

/**
 * Sets the paragraph contents justification.
 * @memberof ApiParaPr
 * @param {("left" | "right" | "both" | "center")} sJc - The justification type that
 * will be applied to the paragraph contents.
 * @returns {boolean}
 */
ApiParaPr.prototype.SetJc = (sJc) => true

/**
 * Returns the paragraph contents justification.
 * @memberof ApiParaPr
 * @returns {("left" | "right" | "both" | "center" | undefined)}
 */
ApiParaPr.prototype.GetJc = () => ""

/**
 * Sets the paragraph line spacing. If the value of the sLineRule parameter is either
 * "atLeast" or "exact", then the value of nLine will be interpreted as twentieths of a point. If
 * the value of the sLineRule parameter is "auto", then the value of the
 * nLine parameter will be interpreted as 240ths of a line.
 * @memberof ApiParaPr
 * @param {(twips | line240)} nLine - The line spacing value measured either in twentieths of a point (1/1440 of an inch) or in 240ths of a line.
 * @param {("auto" | "atLeast" | "exact")} sLineRule - The rule that determines the measuring units of the line spacing.
 * @returns {boolean}
 */
ApiParaPr.prototype.SetSpacingLine = (nLine, sLineRule) => true

/**
 * Returns the paragraph line spacing value.
 * @memberof ApiParaPr
 * @returns {twips | line240 | undefined} - to know is twips or line240 use ApiParaPr.prototype.GetSpacingLineRule().
 */
ApiParaPr.prototype.GetSpacingLineValue = () => new twips()

/**
 * Returns the paragraph line spacing rule.
 * @memberof ApiParaPr
 * @returns {"auto" | "atLeast" | "exact" | undefined}
 */
ApiParaPr.prototype.GetSpacingLineRule = () => ""

/**
 * Sets the spacing before the current paragraph. If the value of the isBeforeAuto parameter is true, then
 * any value of the nBefore is ignored. If isBeforeAuto parameter is not specified, then
 * it will be interpreted as false.
 * @memberof ApiParaPr
 * @param {twips} nBefore - The value of the spacing before the current paragraph measured in twentieths of a point (1/1440 of an inch).
 * @param {boolean} [isBeforeAuto=false] - The true value disables the spacing before the current paragraph.
 * @returns {boolean}
 */
ApiParaPr.prototype.SetSpacingBefore = (nBefore, isBeforeAuto) => true

/**
 * Returns the spacing before value of the current paragraph.
 * @memberof ApiParaPr
 * @returns {twips} - The value of the spacing before the current paragraph measured in twentieths of a point (1/1440 of an inch).
 */
ApiParaPr.prototype.GetSpacingBefore = () => new twips()

/**
 * Sets the spacing after the current paragraph. If the value of the isAfterAuto parameter is true, then
 * any value of the nAfter is ignored. If isAfterAuto parameter is not specified, then it
 * will be interpreted as false.
 * @memberof ApiParaPr
 * @param {twips} nAfter - The value of the spacing after the current paragraph measured in twentieths of a point (1/1440 of an inch).
 * @param {boolean} [isAfterAuto=false] - The true value disables the spacing after the current paragraph.
 * @returns {boolean}
 */
ApiParaPr.prototype.SetSpacingAfter = (nAfter, isAfterAuto) => true

/**
 * Returns the spacing after value of the current paragraph.
 * @memberof ApiParaPr
 * @returns {twips} - The value of the spacing after the current paragraph measured in twentieths of a point (1/1440 of an inch).
 */
ApiParaPr.prototype.GetSpacingAfter = () => new twips()

/**
 * Specifies a sequence of custom tab stops which will be used for any tab characters in the current paragraph.
 * <b>Warning</b>: The lengths of aPos array and aVal array <b>MUST BE</b> equal to each other.
 * @memberof ApiParaPr
 * @param {twips[]} aPos - An array of the positions of custom tab stops with respect to the current page margins
 * measured in twentieths of a point (1/1440 of an inch).
 * @param {TabJc[]} aVal - An array of the styles of custom tab stops, which determines the behavior of the tab
 * stop and the alignment which will be applied to text entered at the current custom tab stop.
 * @returns {boolean}
 */
ApiParaPr.prototype.SetTabs = (aPos, aVal) => true

/**
 * Sets the bullet or numbering to the current paragraph.
 * @memberof ApiParaPr
 * @param {?ApiBullet} oBullet - The bullet object created with the {@link Api#CreateBullet} or {@link Api#CreateNumbering} method.
 */
ApiParaPr.prototype.SetBullet = (oBullet) => {}

/**
 * Sets the outline level for the specified properties.
 * @memberof ApiParaPr
 * @param {Number} [nLvl=undefined] - The outline level. Possible values: 0-8. The 0 value means the basic outline level.
 * To set no outline level, use this method without a parameter.
 * @returns {boolean}
 * @since 8.2.0
 */
ApiParaPr.prototype.SetOutlineLvl = (nLvl) => true

/**
 * Returns the outline level of the specified properties.
 * @memberof ApiParaPr
 * @returns {Number}
 * @since 8.2.0
 */
ApiParaPr.prototype.GetOutlineLvl = () => 0

/**
 * Checks if this is a custom geometry
 * @returns {boolean}
 * @since 9.1.0
 */
ApiGeometry.prototype.IsCustom = () => true

/**
 * Gets the preset name if this is a preset geometry
 * @returns {ShapeType | null}
 * @since 9.1.0
 */
ApiGeometry.prototype.GetPreset = () => new ShapeType()

/**
 * Gets the number of paths in the geometry
 * @returns {number}
 * @since 9.1.0
 */
ApiGeometry.prototype.GetPathCount = () => 0

/**
 * Gets a path by index
 * @param {number} nIndex - Path index
 * @returns {ApiPath}
 * @since 9.1.0
 */
ApiGeometry.prototype.GetPath = (nIndex) => new ApiPath()

/**
 * Gets all paths
 * @returns {ApiPath[]}
 * @since 9.1.0
 */
ApiGeometry.prototype.GetPaths = () => [new ApiPath()]

/**
 * Adds a new path to the geometry
 * @returns {ApiPath | null}
 * @since 9.1.0
 */
ApiGeometry.prototype.AddPath = () => new ApiPath()

/**
 * Gets adjustment value by name
 * @param {string} sName - Adjustment name
 * @returns {number | null}
 * @since 9.1.0
 */
ApiGeometry.prototype.GetAdjValue = (sName) => 0

/**
 * Adds an adjustment value
 * @param {string} sName - Adjustment name
 * @param {number} nValue - Adjustment value
 * @returns {boolean}
 * @since 9.1.0
 */
ApiGeometry.prototype.AddAdj = (sName, nValue) => true

/**
 * Sets an adjustment value
 * @param {string} sName - Adjustment name
 * @param {number} nValue - Adjustment value
 * @since 9.1.0
 */
ApiGeometry.prototype.SetAdjValue = (sName, nValue) => {}

/**
 * Adds a guide (formula)
 * @param {string} sName - Guide name
 * @param {GeometryFormulaType} sFormula - Formula type
 * @param {string} sX - X parameter
 * @param {string} sY - Y parameter
 * @param {string} sZ - Z parameter
 * @returns {boolean}
 * @since 9.1.0
 */
ApiGeometry.prototype.AddGuide = (sName, sFormula, sX, sY, sZ) => true

/**
 * Sets the text rectangle
 * @param {string} sLeft - Left guide name or value
 * @param {string} sTop - Top guide name or value
 * @param {string} sRight - Right guide name or value
 * @param {string} sBottom - Bottom guide name or value
 * @returns {boolean}
 * @since 9.1.0
 */
ApiGeometry.prototype.SetTextRect = (sLeft, sTop, sRight, sBottom) => true

/**
 * Adds a connection point
 * @param {string} sAngle - Angle
 * @param {string} sX - X position
 * @param {string} sY - Y position
 * @since 9.1.0
 */
ApiGeometry.prototype.AddConnectionPoint = (sAngle, sX, sY) => {}

/**
 * Gets the command type
 * @returns {PathCommandType}
 * @since 9.1.0
 */
ApiPathCommand.prototype.GetType = () => new PathCommandType()

/**
 * Gets the X coordinate for moveTo/lineTo commands
 * @returns {string | null}
 * @since 9.1.0
 */
ApiPathCommand.prototype.GetX = () => ""

/**
 * Gets the Y coordinate for moveTo/lineTo commands
 * @returns {string | null}
 * @since 9.1.0
 */
ApiPathCommand.prototype.GetY = () => ""

/**
 * Gets first control point X for bezier curves
 * @returns {string | null}
 * @since 9.1.0
 */
ApiPathCommand.prototype.GetX0 = () => ""

/**
 * Gets first control point Y for bezier curves
 * @returns {string | null}
 * @since 9.1.0
 */
ApiPathCommand.prototype.GetY0 = () => ""

/**
 * Gets second control point X for cubic bezier
 * @returns {string | null}
 * @since 9.1.0
 */
ApiPathCommand.prototype.GetX1 = () => ""

/**
 * Gets second control point Y for cubic bezier
 * @returns {string | null}
 * @since 9.1.0
 */
ApiPathCommand.prototype.GetY1 = () => ""

/**
 * Gets end point X for cubic bezier
 * @returns {string | null}
 * @since 9.1.0
 */
ApiPathCommand.prototype.GetX2 = () => ""

/**
 * Gets end point Y for cubic bezier
 * @returns {string | null}
 * @since 9.1.0
 */
ApiPathCommand.prototype.GetY2 = () => ""

/**
 * Gets width radius for arc
 * @returns {string | null}
 * @since 9.1.0
 */
ApiPathCommand.prototype.GetWR = () => ""

/**
 * Gets height radius for arc
 * @returns {string | null}
 * @since 9.1.0
 */
ApiPathCommand.prototype.GetHR = () => ""

/**
 * Gets start angle for arc
 * @returns {string | null}
 * @since 9.1.0
 */
ApiPathCommand.prototype.GetStartAngle = () => ""

/**
 * Gets sweep angle for arc
 * @returns {string | null}
 * @since 9.1.0
 */
ApiPathCommand.prototype.GetSweepAngle = () => ""

/**
 * Gets whether the path is stroked
 * @returns {boolean}
 * @since 9.1.0
 */
ApiPath.prototype.GetStroke = () => true

/**
 * Sets whether the path should be stroked
 * @param {boolean} bStroke - Whether to stroke the path
 * @since 9.1.0
 */
ApiPath.prototype.SetStroke = (bStroke) => {}

/**
 * Gets the fill type
 * @returns {PathFillType}
 * @since 9.1.0
 */
ApiPath.prototype.GetFill = () => new PathFillType()

/**
 * Sets the fill type for the path
 * @param {PathFillType} sFill - Fill type
 * @since 9.1.0
 */
ApiPath.prototype.SetFill = (sFill) => {}

/**
 * Gets the path width
 * @returns {number}
 * @since 9.1.0
 */
ApiPath.prototype.GetWidth = () => 0

/**
 * Sets the path width
 * @param {number} nWidth - Width in EMU
 * @since 9.1.0
 */
ApiPath.prototype.SetWidth = (nWidth) => {}

/**
 * Gets the path height
 * @returns {number}
 * @since 9.1.0
 */
ApiPath.prototype.GetHeight = () => 0

/**
 * Sets the path height
 * @param {number} nHeight - Height in EMU
 * @since 9.1.0
 */
ApiPath.prototype.SetHeight = (nHeight) => {}

/**
 * Gets all path commands
 * @returns {ApiPathCommand[]}
 * @since 9.1.0
 */
ApiPath.prototype.GetCommands = () => [new ApiPathCommand()]

/**
 * Gets command count
 * @returns {number}
 * @since 9.1.0
 */
ApiPath.prototype.GetCommandCount = () => 0

/**
 * Gets a specific command by index
 * @param {number} nIndex - Command index
 * @returns {ApiPathCommand | null}
 * @since 9.1.0
 */
ApiPath.prototype.GetCommand = (nIndex) => new ApiPathCommand()

/**
 * Moves to a point
 * @param {GeometryCoordinate} x - X coordinate
 * @param {GeometryCoordinate} y - Y coordinate
 * @since 9.1.0
 */
ApiPath.prototype.MoveTo = (x, y) => {}

/**
 * Draws a line to a point
 * @param {GeometryCoordinate} x - X coordinate
 * @param {GeometryCoordinate} y - Y coordinate
 * @since 9.1.0
 */
ApiPath.prototype.LineTo = (x, y) => {}

/**
 * Draws a cubic bezier curve
 * @param {GeometryCoordinate} x1 - First control point X
 * @param {GeometryCoordinate} y1 - First control point Y
 * @param {GeometryCoordinate} x2 - Second control point X
 * @param {GeometryCoordinate} y2 - Second control point Y
 * @param {GeometryCoordinate} x3 - End point X
 * @param {GeometryCoordinate} y3 - End point Y
 * @since 9.1.0
 */
ApiPath.prototype.CubicBezTo = (x1, y1, x2, y2, x3, y3) => {}

/**
 * Draws a quadratic bezier curve
 * @param {GeometryCoordinate} x1 - Control point X
 * @param {GeometryCoordinate} y1 - Control point Y
 * @param {GeometryCoordinate} x2 - End point X
 * @param {GeometryCoordinate} y2 - End point Y
 * @since 9.1.0
 */
ApiPath.prototype.QuadBezTo = (x1, y1, x2, y2) => {}

/**
 * Draws an arc
 * @param {GeometryCoordinate} wR - Width radius
 * @param {GeometryCoordinate} hR - Height radius
 * @param {GeometryCoordinate} stAng - Start angle
 * @param {GeometryCoordinate} swAng - Sweep angle Y
 * @since 9.1.0
 */
ApiPath.prototype.ArcTo = (wR, hR, stAng, swAng) => {}

/**
 * Closes the current path
 * @since 9.1.0
 */
ApiPath.prototype.Close = () => {}

/**
 * Returns a type of the ApiChart class.
 * @memberof ApiChart
 * @returns {"chart"}
 */
ApiChart.prototype.GetClassType = () => ""

/**
 * Returns a type of the chart object.
 * @memberof ApiChart
 * @returns {ChartType}
 */
ApiChart.prototype.GetChartType = () => new ChartType()

/**
 *  Specifies the chart title.
 *  @memberof ApiChart
 *  @param {string} sTitle - The title which will be displayed for the current chart.
 *  @param {pt} nFontSize - The text size value measured in points.
 *  @param {boolean} bIsBold - Specifies if the chart title is written in bold font or not.
 * @returns {boolean}
 */
ApiChart.prototype.SetTitle = (sTitle, nFontSize, bIsBold) => true

/**
 *  Specifies the chart horizontal axis title.
 *  @memberof ApiChart
 *  @param {string} sTitle - The title which will be displayed for the horizontal axis of the current chart.
 *  @param {pt} nFontSize - The text size value measured in points.
 *  @param {boolean} bIsBold - Specifies if the horizontal axis title is written in bold font or not.
 *@returns {boolean}
 */
ApiChart.prototype.SetHorAxisTitle = (sTitle, nFontSize, bIsBold) => true

/**
 *  Specifies the chart vertical axis title.
 *  @memberof ApiChart
 *  @param {string} sTitle - The title which will be displayed for the vertical axis of the current chart.
 *  @param {pt} nFontSize - The text size value measured in points.
 *  @param {boolean} bIsBold - Specifies if the vertical axis title is written in bold font or not.
 *@returns {boolean}
 */
ApiChart.prototype.SetVerAxisTitle = (sTitle, nFontSize, bIsBold) => true

/**
 * Specifies the vertical axis orientation.
 * @memberof ApiChart
 * @param {boolean} bIsMinMax - The <code>true</code> value will set the normal data direction for the vertical axis (from minimum to maximum).
 * @returns {boolean}
 */
ApiChart.prototype.SetVerAxisOrientation = (bIsMinMax) => true

/**
 * Specifies the horizontal axis orientation.
 * @memberof ApiChart
 * @param {boolean} bIsMinMax - The <code>true</code> value will set the normal data direction for the horizontal axis (from minimum to maximum).
 * @returns {boolean}
 */
ApiChart.prototype.SetHorAxisOrientation = (bIsMinMax) => true

/**
 * Specifies the chart legend position.
 * @memberof ApiChart
 * @param {"left" | "top" | "right" | "bottom" | "none"} sLegendPos - The position of the chart legend inside the chart window.
 * @returns {boolean}
 */
ApiChart.prototype.SetLegendPos = (sLegendPos) => true

/**
 * Specifies the legend font size.
 * @memberof ApiChart
 * @param {pt} nFontSize - The text size value measured in points.
 * @returns {boolean}
 */
ApiChart.prototype.SetLegendFontSize = (nFontSize) => true

/**
 * Specifies which chart data labels are shown for the chart.
 * @memberof ApiChart
 * @param {boolean} bShowSerName - Whether to show or hide the source table column names used for the data which the chart will be build from.
 * @param {boolean} bShowCatName - Whether to show or hide the source table row names used for the data which the chart will be build from.
 * @param {boolean} bShowVal - Whether to show or hide the chart data values.
 * @param {boolean} bShowPercent - Whether to show or hide the percent for the data values (works with stacked chart types).
 * @returns {boolean}
 */
ApiChart.prototype.SetShowDataLabels = (bShowSerName, bShowCatName, bShowVal, bShowPercent) => true

/**
 * Spicifies the show options for data labels.
 * @memberof ApiChart
 * @param {number} nSeriesIndex - The series index from the array of the data used to build the chart from.
 * @param {number} nPointIndex - The point index from this series.
 * @param {boolean} bShowSerName - Whether to show or hide the source table column names used for the data which the chart will be build from.
 * @param {boolean} bShowCatName - Whether to show or hide the source table row names used for the data which the chart will be build from.
 * @param {boolean} bShowVal - Whether to show or hide the chart data values.
 * @param {boolean} bShowPercent - Whether to show or hide the percent for the data values (works with stacked chart types).
 * @returns {boolean}
 */
ApiChart.prototype.SetShowPointDataLabel = (
  nSeriesIndex,
  nPointIndex,
  bShowSerName,
  bShowCatName,
  bShowVal,
  bShowPercent,
) => true

/**
 * Spicifies tick labels position for the vertical axis.
 * @memberof ApiChart
 * @param {TickLabelPosition} sTickLabelPosition - The type for the position of chart vertical tick labels.
 * @returns {boolean}
 */
ApiChart.prototype.SetVertAxisTickLabelPosition = (sTickLabelPosition) => true

/**
 * Spicifies tick labels position for the horizontal axis.
 * @memberof ApiChart
 * @param {TickLabelPosition} sTickLabelPosition - The type for the position of chart horizontal tick labels.
 * @returns {boolean}
 */
ApiChart.prototype.SetHorAxisTickLabelPosition = (sTickLabelPosition) => true

/**
 * Specifies major tick mark for the horizontal axis.
 * @memberof ApiChart
 * @param {TickMark} sTickMark - The type of tick mark appearance.
 * @returns {boolean}
 */
ApiChart.prototype.SetHorAxisMajorTickMark = (sTickMark) => true

/**
 * Specifies minor tick mark for the horizontal axis.
 * @memberof ApiChart
 * @param {TickMark} sTickMark - The type of tick mark appearance.
 * @returns {boolean}
 */
ApiChart.prototype.SetHorAxisMinorTickMark = (sTickMark) => true

/**
 * Specifies major tick mark for the vertical axis.
 * @memberof ApiChart
 * @param {TickMark} sTickMark - The type of tick mark appearance.
 * @returns {boolean}
 */
ApiChart.prototype.SetVertAxisMajorTickMark = (sTickMark) => true

/**
 * Specifies minor tick mark for the vertical axis.
 * @memberof ApiChart
 * @param {TickMark} sTickMark - The type of tick mark appearance.
 * @returns {boolean}
 */
ApiChart.prototype.SetVertAxisMinorTickMark = (sTickMark) => true

/**
 * Specifies major vertical gridline visual properties.
 * @memberof ApiChart
 * @param {?ApiStroke} oStroke - The stroke used to create the element shadow.
 * @returns {boolean}
 */
ApiChart.prototype.SetMajorVerticalGridlines = (oStroke) => true

/**
 * Specifies minor vertical gridline visual properties.
 * @memberof ApiChart
 * @param {?ApiStroke} oStroke - The stroke used to create the element shadow.
 * @returns {boolean}
 */
ApiChart.prototype.SetMinorVerticalGridlines = (oStroke) => true

/**
 * Specifies major horizontal gridline visual properties.
 * @memberof ApiChart
 * @param {?ApiStroke} oStroke - The stroke used to create the element shadow.
 * @returns {boolean}
 */
ApiChart.prototype.SetMajorHorizontalGridlines = (oStroke) => true

/**
 * Specifies minor horizontal gridline visual properties.
 * @memberof ApiChart
 * @param {?ApiStroke} oStroke - The stroke used to create the element shadow.
 * @returns {boolean}
 */
ApiChart.prototype.SetMinorHorizontalGridlines = (oStroke) => true

/**
 * Removes the specified series from the current chart.
 * @memberof ApiChart
 * @param {number} nSeria - The index of the chart series.
 * @returns {boolean}
 */
ApiChart.prototype.RemoveSeria = (nSeria) => true

/**
 * Sets values to the specified chart series.
 * @memberof ApiChart
 * @param {number[]} aValues - The array of the data which will be set to the specified chart series.
 * @param {number} nSeria - The index of the chart series.
 * @returns {boolean}
 */
ApiChart.prototype.SetSeriaValues = (aValues, nSeria) => true

/**
 * Sets the x-axis values to all chart series. It is used with the scatter charts only.
 * @memberof ApiChart
 * @param {string[]} aValues - The array of the data which will be set to the x-axis data points.
 * @returns {boolean}
 */
ApiChart.prototype.SetXValues = (aValues) => true

/**
 * Sets a name to the specified chart series.
 * @memberof ApiChart
 * @param {string} sName - The name which will be set to the specified chart series.
 * @param {number} nSeria - The index of the chart series.
 * @returns {boolean}
 */
ApiChart.prototype.SetSeriaName = (sName, nSeria) => true

/**
 * Sets a name to the specified chart category.
 * @memberof ApiChart
 * @param {string} sName - The name which will be set to the specified chart category.
 * @param {number} nCategory - The index of the chart category.
 * @returns {boolean}
 */
ApiChart.prototype.SetCategoryName = (sName, nCategory) => true

/**
 * Sets a style to the current chart by style ID.
 * @memberof ApiChart
 * @param nStyleId - One of the styles available in the editor.
 * @returns {boolean}
 */
ApiChart.prototype.ApplyChartStyle = (nStyleId) => true

/**
 * Sets the fill to the chart plot area.
 * @memberof ApiChart
 * @param {ApiFill} oFill - The fill type used to fill the plot area.
 * @returns {boolean}
 */
ApiChart.prototype.SetPlotAreaFill = (oFill) => true

/**
 * Sets the outline to the chart plot area.
 * @memberof ApiChart
 * @param {ApiStroke} oStroke - The stroke used to create the plot area outline.
 * @returns {boolean}
 */
ApiChart.prototype.SetPlotAreaOutLine = (oStroke) => true

/**
 * Sets the fill to the specified chart series.
 * @memberof ApiChart
 * @param {ApiFill} oFill - The fill type used to fill the series.
 * @param {number} nSeries - The index of the chart series.
 * @param {boolean} [bAll=false] - Specifies if the fill will be applied to all series.
 * @returns {boolean}
 */
ApiChart.prototype.SetSeriesFill = (oFill, nSeries, bAll) => true

/**
 * Sets the outline to the specified chart series.
 * @memberof ApiChart
 * @param {ApiStroke} oStroke - The stroke used to create the series outline.
 * @param {number} nSeries - The index of the chart series.
 * @param {boolean} [bAll=false] - Specifies if the outline will be applied to all series.
 * @returns {boolean}
 */
ApiChart.prototype.SetSeriesOutLine = (oStroke, nSeries, bAll) => true

/**
 * Sets the fill to the data point in the specified chart series.
 * @memberof ApiChart
 * @param {ApiFill} oFill - The fill type used to fill the data point.
 * @param {number} nSeries - The index of the chart series.
 * @param {number} nDataPoint - The index of the data point in the specified chart series.
 * @param {boolean} [bAllSeries=false] - Specifies if the fill will be applied to the specified data point in all series.
 * @returns {boolean}
 */
ApiChart.prototype.SetDataPointFill = (oFill, nSeries, nDataPoint, bAllSeries) => true

/**
 * Sets the outline to the data point in the specified chart series.
 * @memberof ApiChart
 * @param {ApiStroke} oStroke - The stroke used to create the data point outline.
 * @param {number} nSeries - The index of the chart series.
 * @param {number} nDataPoint - The index of the data point in the specified chart series.
 * @param {boolean} bAllSeries - Specifies if the outline will be applied to the specified data point in all series.
 * @returns {boolean}
 */
ApiChart.prototype.SetDataPointOutLine = (oStroke, nSeries, nDataPoint, bAllSeries) => true

/**
 * Sets the fill to the marker in the specified chart series.
 * @memberof ApiChart
 * @param {ApiFill} oFill - The fill type used to fill the marker.
 * @param {number} nSeries - The index of the chart series.
 * @param {number} nMarker - The index of the marker in the specified chart series.
 * @param {boolean} [bAllMarkers=false] - Specifies if the fill will be applied to all markers in the specified chart series.
 * @returns {boolean}
 */
ApiChart.prototype.SetMarkerFill = (oFill, nSeries, nMarker, bAllMarkers) => true

/**
 * Sets the outline to the marker in the specified chart series.
 * @memberof ApiChart
 * @param {ApiStroke} oStroke - The stroke used to create the marker outline.
 * @param {number} nSeries - The index of the chart series.
 * @param {number} nMarker - The index of the marker in the specified chart series.
 * @param {boolean} [bAllMarkers=false] - Specifies if the outline will be applied to all markers in the specified chart series.
 * @returns {boolean}
 */
ApiChart.prototype.SetMarkerOutLine = (oStroke, nSeries, nMarker, bAllMarkers) => true

/**
 * Sets the fill to the chart title.
 * @memberof ApiChart
 * @param {ApiFill} oFill - The fill type used to fill the title.
 * @returns {boolean}
 */
ApiChart.prototype.SetTitleFill = (oFill) => true

/**
 * Sets the outline to the chart title.
 * @memberof ApiChart
 * @param {ApiStroke} oStroke - The stroke used to create the title outline.
 * @returns {boolean}
 */
ApiChart.prototype.SetTitleOutLine = (oStroke) => true

/**
 * Sets the fill to the chart legend.
 * @memberof ApiChart
 * @param {ApiFill} oFill - The fill type used to fill the legend.
 * @returns {boolean}
 */
ApiChart.prototype.SetLegendFill = (oFill) => true

/**
 * Sets the outline to the chart legend.
 * @memberof ApiChart
 * @param {ApiStroke} oStroke - The stroke used to create the legend outline.
 * @returns {boolean}
 */
ApiChart.prototype.SetLegendOutLine = (oStroke) => true

/**
 * Sets the specified numeric format to the axis values.
 * @memberof ApiChart
 * @param {NumFormat | String} sFormat - Numeric format (can be custom format).
 * @param {AxisPos} - Axis position in the chart.
 * @returns {boolean}
 */
ApiChart.prototype.SetAxieNumFormat = (sFormat, sAxiePos) => true

/**
 * Sets the specified numeric format to the chart series.
 * @memberof ApiChart
 * @param {NumFormat | String} sFormat - Numeric format (can be custom format).
 * @param {Number} nSeria - Series index.
 * @returns {boolean}
 */
ApiChart.prototype.SetSeriaNumFormat = (sFormat, nSeria) => true

/**
 * Sets the specified numeric format to the chart data point.
 * @memberof ApiChart
 * @param {NumFormat | String} sFormat - Numeric format (can be custom format).
 * @param {Number} nSeria - Series index.
 * @param {number} nDataPoint - The index of the data point in the specified chart series.
 * @param {boolean} bAllSeries - Specifies if the numeric format will be applied to the specified data point in all series.
 * @returns {boolean}
 */
ApiChart.prototype.SetDataPointNumFormat = (sFormat, nSeria, nDataPoint, bAllSeries) => true

/**
 * Returns all series from the chart space.
 * @memberof ApiChart
 * @returns {ApiChartSeries[]}
 */
ApiChart.prototype.GetAllSeries = () => [new ApiChartSeries()]

/**
 * Returns the series with a specific index.
 * @memberof ApiChart
 * @param {number} nIdx - Series index.
 * @returns {ApiChartSeries}
 */
ApiChart.prototype.GetSeries = (nIdx) => new ApiChartSeries()

/**
 * Returns a type of the ApiChartSeries class.
 * @memberof ApiChartSeries
 * @returns {"chartSeries"}
 */
ApiChartSeries.prototype.GetClassType = () => ""

/**
 * Tries to change the series type. Returns true if successful.
 * @memberof ApiChartSeries
 * @param {ChartType} sType - Chart type.
 * @returns {boolean}
 */
ApiChartSeries.prototype.ChangeChartType = (sType) => true

/**
 * Returns a chart type of the current series.
 * @memberof ApiChartSeries
 * @returns {ChartType}
 */
ApiChartSeries.prototype.GetChartType = () => new ChartType()

/**
 * Returns a type of the ApiFill class.
 * @memberof ApiFill
 * @returns {"fill"}
 */
ApiFill.prototype.GetClassType = () => ""

/**
 * Returns a type of the ApiStroke class.
 * @memberof ApiStroke
 * @returns {"stroke"}
 */
ApiStroke.prototype.GetClassType = () => ""

/**
 * Returns a type of the ApiGradientStop class.
 * @memberof ApiGradientStop
 * @returns {"gradientStop"}
 */
ApiGradientStop.prototype.GetClassType = () => ""

/**
 * Returns a type of the ApiUniColor class.
 * @memberof ApiUniColor
 * @returns {"uniColor"}
 */
ApiUniColor.prototype.GetClassType = () => ""

/**
 * Returns a type of the ApiRGBColor class.
 * @memberof ApiRGBColor
 * @returns {"rgbColor"}
 */
ApiRGBColor.prototype.GetClassType = () => ""

/**
 * Returns a type of the ApiSchemeColor class.
 * @memberof ApiSchemeColor
 * @returns {"schemeColor"}
 */
ApiSchemeColor.prototype.GetClassType = () => ""

/**
 * Returns a type of the ApiPresetColor class.
 * @memberof ApiPresetColor
 * @returns {"presetColor"}
 */
ApiPresetColor.prototype.GetClassType = () => ""

/**
 * Returns a type of the ApiBullet class.
 * @memberof ApiBullet
 * @returns {"bullet"}
 */
ApiBullet.prototype.GetClassType = () => ""

/**
 * Replaces each paragraph (or text in cell) in the select with the corresponding text from an array of strings.
 * @memberof ApiInterface
 * @param {string[]} textStrings - An array of replacement strings.
 * @param {string} [tab="\t"] - A character which is used to specify the tab in the source text.
 * @param {string} [newLine="\r\n"] - A character which is used to specify the line break character in the source text.
 * @returns {boolean}
 */
ApiInterface.prototype.ReplaceTextSmart = (textStrings, tab, newLine) => true

/**
 * Creates the empty text properties.
 * @memberof ApiInterface
 * @returns {ApiTextPr}
 */
ApiInterface.prototype.CreateTextPr = () => new ApiTextPr()

/**
 * Returns the full name of the currently opened file.
 * @memberof ApiInterface
 * @returns {string}
 */
ApiInterface.prototype.GetFullName = () => ""

/**
 * Returns the full name of the currently opened file.
 * @memberof ApiInterface
 * @returns {string}
 */
ApiInterface.prototype.FullName = ApiInterface.prototype.GetFullName()

/**
 * Converts pixels to EMUs (English Metric Units).
 *
 * @memberof ApiInterface
 * @returns {number}
 */
ApiInterface.prototype.PixelsToEmus = function Px2Emu(px) {
  return 0
}

/**
 * Converts millimeters to pixels.
 *
 * @memberof ApiInterface
 * @returns {number}
 */
ApiInterface.prototype.MillimetersToPixels = function Mm2Px(mm) {
  return 0
}

/**
 * Converts points to centimeters.
 *
 * @memberof ApiInterface
 * @returns {number}
 */
ApiInterface.prototype.PointsToCentimeters = function PointsToCentimeters(pt) {
  return 0
}

/**
 * Converts points to EMUs (English Metric Units).
 *
 * @memberof ApiInterface
 * @returns {number}
 */
ApiInterface.prototype.PointsToEmus = function PointsToEmus(pt) {
  return 0
}

/**
 * Converts points to inches.
 *
 * @memberof ApiInterface
 * @returns {number}
 */
ApiInterface.prototype.PointsToInches = function PointsToInches(pt) {
  return 0
}

/**
 * Converts points to lines (1 line = 12 points).
 *
 * @memberof ApiInterface
 * @returns {number}
 */
ApiInterface.prototype.PointsToLines = function PointsToLines(pt) {
  return 0
}

/**
 * Converts points to millimeters.
 *
 * @memberof ApiInterface
 * @returns {number}
 */
ApiInterface.prototype.PointsToMillimeters = function PointsToMillimeters(pt) {
  return 0
}

/**
 * Converts points to picas (1 pica = 12 points).
 *
 * @memberof ApiInterface
 * @returns {number}
 */
ApiInterface.prototype.PointsToPicas = function PointsToPicas(pt) {
  return 0
}

/**
 * Converts points to pixels.
 *
 * @memberof ApiInterface
 * @returns {number}
 */
ApiInterface.prototype.PointsToPixels = function PointsToPixels(pt) {
  return 0
}

/**
 * Converts points to twips.
 *
 * @memberof ApiInterface
 * @returns {number}
 */
ApiInterface.prototype.PointsToTwips = function PointsToTwips(pt) {
  return 0
}

/**
 * Converts centimeters to points.
 *
 * @memberof ApiInterface
 * @returns {number}
 */
ApiInterface.prototype.CentimetersToPoints = function CentimetersToPoints(cm) {
  return 0
}

/**
 * Converts EMUs (English Metric Units) to points.
 *
 * @memberof ApiInterface
 * @returns {number}
 */
ApiInterface.prototype.EmusToPoints = function EmusToPoints(emu) {
  return 0
}

/**
 * Converts inches to points.
 *
 * @memberof ApiInterface
 * @returns {number}
 */
ApiInterface.prototype.InchesToPoints = function InchesToPoints(inches) {
  return 0
}

/**
 * Converts lines to points (1 line = 12 points).
 *
 * @memberof ApiInterface
 * @returns {number}
 */
ApiInterface.prototype.LinesToPoints = function LinesToPoints(lines) {
  return 0
}

/**
 * Converts millimeters to points.
 *
 * @memberof ApiInterface
 * @returns {number}
 */
ApiInterface.prototype.MillimetersToPoints = function MillimetersToPoints(mm) {
  return 0
}

/**
 * Converts picas to points.
 *
 * @memberof ApiInterface
 * @returns {number}
 */
ApiInterface.prototype.PicasToPoints = function PicasToPoints(pc) {
  return 0
}

/**
 * Converts pixels to points.
 *
 * @memberof ApiInterface
 * @returns {number}
 */
ApiInterface.prototype.PixelsToPoints = function PixelsToPoints(px) {
  return 0
}

/**
 * Converts twips to points.
 *
 * @memberof ApiInterface
 * @returns {number}
 */
ApiInterface.prototype.TwipsToPoints = function TwipsToPoints(twips) {
  return 0
}

/**
 * Returns a type of the ApiComment class.
 * @memberof ApiComment
 * @returns {"comment"}
 */
ApiComment.prototype.GetClassType = () => ""

/**
 * Returns the comment text.
 * @memberof ApiComment
 * @returns {string}
 */
ApiComment.prototype.GetText = () => ""

/**
 * Sets the comment text.
 * @memberof ApiComment
 * @param {string} sText - The comment text.
 * @returns {ApiComment} - this
 */
ApiComment.prototype.SetText = (sText) => new ApiComment()

/**
 * Returns the comment author's name.
 * @memberof ApiComment
 * @returns {string}
 */
ApiComment.prototype.GetAuthorName = () => ""

/**
 * Sets the comment author's name.
 * @memberof ApiComment
 * @param {string} sAuthorName - The comment author's name.
 * @returns {ApiComment} - this
 */
ApiComment.prototype.SetAuthorName = (sAuthorName) => new ApiComment()

/**
 * Returns the user ID of the comment author.
 * @memberof ApiComment
 * @returns {string}
 */
ApiComment.prototype.GetUserId = () => ""

/**
 * Sets the user ID to the comment author.
 * @memberof ApiComment
 * @param {string} sUserId - The user ID of the comment author.
 * @returns {ApiComment} - this
 */
ApiComment.prototype.SetUserId = (sUserId) => new ApiComment()

/**
 * Checks if a comment is solved or not.
 * @memberof ApiComment
 * @returns {boolean}
 */
ApiComment.prototype.IsSolved = () => true

/**
 * Marks a comment as solved.
 * @memberof ApiComment
 * @param {boolean} bSolved - Specifies if a comment is solved or not.
 * @returns {ApiComment} - this
 */
ApiComment.prototype.SetSolved = (bSolved) => new ApiComment()

/**
 * Returns the timestamp of the comment creation in UTC format.
 * @memberof ApiComment
 * @returns {Number}
 */
ApiComment.prototype.GetTimeUTC = () => 0

/**
 * Sets the timestamp of the comment creation in UTC format.
 * @memberof ApiComment
 * @param {Number | String} nTimeStamp - The timestamp of the comment creation in UTC format.
 * @returns {ApiComment} - this
 */
ApiComment.prototype.SetTimeUTC = (timeStamp) => new ApiComment()

/**
 * Returns the timestamp of the comment creation in the current time zone format.
 * @memberof ApiComment
 * @returns {Number}
 */
ApiComment.prototype.GetTime = () => 0

/**
 * Sets the timestamp of the comment creation in the current time zone format.
 * @memberof ApiComment
 * @param {Number | String} nTimeStamp - The timestamp of the comment creation in the current time zone format.
 * @returns {ApiComment} - this
 */
ApiComment.prototype.SetTime = (timeStamp) => new ApiComment()

/**
 * Returns the quote text of the current comment.
 * @memberof ApiComment
 * @returns {Number}
 */
ApiComment.prototype.GetQuoteText = () => 0

/**
 * Returns a number of the comment replies.
 * @memberof ApiComment
 * @returns {Number}
 */
ApiComment.prototype.GetRepliesCount = () => 0

/**
 * Adds a reply to a comment.
 * @memberof ApiComment
 * @param {String} sText - The comment reply text (required).
 * @param {String} sAuthorName - The name of the comment reply author (optional).
 * @param {String} sUserId - The user ID of the comment reply author (optional).
 * @param {Number} [nPos=-1] - The comment reply position. If nPos=-1 add to the end.
 * @returns {ApiComment} - this
 */
ApiComment.prototype.AddReply = (sText, sAuthorName, sUserId, nPos) => new ApiComment()

/**
 * Removes the specified comment replies.
 * @memberof ApiComment
 * @param {Number} [nPos = 0] - The position of the first comment reply to remove.
 * @param {Number} [nCount = 1] - A number of comment replies to remove.
 * @param {boolean} [bRemoveAll = false] - Specifies whether to remove all comment replies or not.
 * @returns {ApiComment} - this
 */
ApiComment.prototype.RemoveReplies = (nPos, nCount, bRemoveAll) => new ApiComment()

/**
 * Deletes the current comment from the document.
 * @memberof ApiComment
 * @returns {boolean}
 */
ApiComment.prototype.Delete = () => true

/**
 * Sets the position of the comment in the document.
 *
 * @memberof ApiComment
 * @param {number} x - The X coordinate of the comment position in EMU.
 * @param {number} y - The Y coordinate of the comment position in EMU.
 */
ApiComment.prototype.SetPosition = (x, y) => {}

/**
 * Returns the position of the comment in the document.
 *
 * @memberof ApiComment
 * @returns {Object} - An object with the coordinates (in EMU) of the comment position.
 */
ApiComment.prototype.GetPosition = () => new Object()

/**
 * Returns a type of the ApiCommentReply class.
 * @memberof ApiCommentReply
 * @returns {"commentReply"}
 */
ApiCommentReply.prototype.GetClassType = () => ""

/**
 * Returns the comment reply text.
 * @memberof ApiCommentReply
 * @returns {string}
 */
ApiCommentReply.prototype.GetText = () => ""

/**
 * Sets the comment reply text.
 * @memberof ApiCommentReply
 * @param {string} sText - The comment reply text.
 * @returns {ApiCommentReply} - this
 */
ApiCommentReply.prototype.SetText = (sText) => new ApiCommentReply()

/**
 * Returns the comment reply author's name.
 * @memberof ApiCommentReply
 * @returns {string}
 */
ApiCommentReply.prototype.GetAuthorName = () => ""

/**
 * Sets the comment reply author's name.
 * @memberof ApiCommentReply
 * @param {string} sAuthorName - The comment reply author's name.
 * @returns {ApiCommentReply} - this
 */
ApiCommentReply.prototype.SetAuthorName = (sAuthorName) => new ApiCommentReply()

/**
 * Sets the user ID to the comment reply author.
 * @memberof ApiCommentReply
 * @param {string} sUserId - The user ID of the comment reply author.
 * @returns {ApiCommentReply} - this
 */
ApiCommentReply.prototype.SetUserId = (sUserId) => new ApiCommentReply()

/**
 * Returns a type of the ApiCore class.
 * @memberof ApiCore
 * @returns {"core"}
 * @since 9.0.0
 */
ApiCore.prototype.GetClassType = () => ""

/**
 * Sets the document category.
 * @memberof ApiCore
 * @param {string} sCategory - The document category.
 * @since 9.0.0
 */
ApiCore.prototype.SetCategory = (sCategory) => {}

/**
 * Returns the document category.
 * @memberof ApiCore
 * @returns {string} - The document category.
 * @since 9.0.0
 */
ApiCore.prototype.GetCategory = () => ""

/**
 * Sets the document content status.
 * @memberof ApiCore
 * @param {string} sStatus - The document content status.
 * @since 9.0.0
 */
ApiCore.prototype.SetContentStatus = (sStatus) => {}

/**
 * Returns the document content status.
 * @memberof ApiCore
 * @returns {string} - The document content status.
 * @since 9.0.0
 */
ApiCore.prototype.GetContentStatus = () => ""

/**
 * Sets the document creation date.
 * @memberof ApiCore
 * @param {Date} oCreated - The document creation date.
 * @since 9.0.0
 */
ApiCore.prototype.SetCreated = (oCreated) => {}

/**
 * Returns the document creation date.
 * @memberof ApiCore
 * @returns {Date}- The document creation date.
 * @since 9.0.0
 */
ApiCore.prototype.GetCreated = () => new Date()

/**
 * Sets the document author.
 * @memberof ApiCore
 * @param {string} sCreator - The document author.
 * @since 9.0.0
 */
ApiCore.prototype.SetCreator = (sCreator) => {}

/**
 * Returns the document author.
 * @memberof ApiCore
 * @returns {string} - The document author.
 * @since 9.0.0
 */
ApiCore.prototype.GetCreator = () => ""

/**
 * Sets the document description.
 * @memberof ApiCore
 * @param {string} sDescription - The document description.
 * @since 9.0.0
 */
ApiCore.prototype.SetDescription = (sDescription) => {}

/**
 * Returns the document description.
 * @memberof ApiCore
 * @returns {string} - The document description.
 * @since 9.0.0
 */
ApiCore.prototype.GetDescription = () => ""

/**
 * Sets the document identifier.
 * @memberof ApiCore
 * @param {string} sIdentifier - The document identifier.
 * @since 9.0.0
 */
ApiCore.prototype.SetIdentifier = (sIdentifier) => {}

/**
 * Returns the document identifier.
 * @memberof ApiCore
 * @returns {string} - The document identifier.
 * @since 9.0.0
 */
ApiCore.prototype.GetIdentifier = () => ""

/**
 * Sets the document keywords.
 * @memberof ApiCore
 * @param {string} sKeywords - The document keywords in the string format.
 * @since 9.0.0
 *
 */
ApiCore.prototype.SetKeywords = (sKeywords) => {}

/**
 * Returns the document keywords.
 * @memberof ApiCore
 * @returns {string} - The document keywords in the string format.
 * @since 9.0.0
 */
ApiCore.prototype.GetKeywords = () => ""

/**
 * Sets the document language.
 * @memberof ApiCore
 * @param {string} sLanguage - The document language.
 * @since 9.0.0
 */
ApiCore.prototype.SetLanguage = (sLanguage) => {}

/**
 * Returns the document language.
 * @memberof ApiCore
 * @returns {string} - The document language.
 * @since 9.0.0
 */
ApiCore.prototype.GetLanguage = () => ""

/**
 * Sets the name of the user who last modified the document.
 * @memberof ApiCore
 * @param {string} sLastModifiedBy - The name of the user who last modified the document.
 * @since 9.0.0
 */
ApiCore.prototype.SetLastModifiedBy = (sLastModifiedBy) => {}

/**
 * Returns the name of the user who last modified the document.
 * @memberof ApiCore
 * @returns {string} - The name of the user who last modified the document.
 * @since 9.0.0
 */
ApiCore.prototype.GetLastModifiedBy = () => ""

/**
 * Sets the date when the document was last printed.
 * @memberof ApiCore
 * @param {Date} oLastPrinted - The date when the document was last printed.
 * @since 9.0.0
 */
ApiCore.prototype.SetLastPrinted = (oLastPrinted) => {}

/**
 * Returns the date when the document was last printed.
 * @memberof ApiCore
 * @returns {Date} - The date when the document was last printed.
 * @since 9.0.0
 */
ApiCore.prototype.GetLastPrinted = () => new Date()

/**
 * Sets the date when the document was last modified.
 * @memberof ApiCore
 * @param {Date} oModified - The date when the document was last modified.
 * @since 9.0.0
 */
ApiCore.prototype.SetModified = (oModified) => {}

/**
 * Returns the date when the document was last modified.
 * @memberof ApiCore
 * @returns {Date} - The date when the document was last modified.
 * @since 9.0.0
 */
ApiCore.prototype.GetModified = () => new Date()

/**
 * Sets the document revision.
 * @memberof ApiCore
 * @param {string} sRevision - The document revision.
 * @since 9.0.0
 */
ApiCore.prototype.SetRevision = (sRevision) => {}

/**
 * Returns the document revision.
 * @memberof ApiCore
 * @returns {string} - The document revision.
 * @since 9.0.0
 */
ApiCore.prototype.GetRevision = () => ""

/**
 * Sets the document subject.
 * @memberof ApiCore
 * @param {string} sSubject - The document subject.
 * @since 9.0.0
 */
ApiCore.prototype.SetSubject = (sSubject) => {}

/**
 * Returns the document subject.
 * @memberof ApiCore
 * @returns {string} - The document subject.
 * @since 9.0.0
 */
ApiCore.prototype.GetSubject = () => ""

/**
 * Sets the document title.
 * @memberof ApiCore
 * @param {string} sTitle - The document title.
 * @since 9.0.0
 */
ApiCore.prototype.SetTitle = (sTitle) => {}

/**
 * Returns the document title.
 * @memberof ApiCore
 * @returns {string} - The document title.
 * @since 9.0.0
 */
ApiCore.prototype.GetTitle = () => ""

/**
 * Sets the document version.
 * @memberof ApiCore
 * @param {string} sVersion - The document version.
 * @since 9.0.0
 */
ApiCore.prototype.SetVersion = (sVersion) => {}

/**
 * Returns the document version.
 * @memberof ApiCore
 * @returns {string} - The document version.
 * @since 9.0.0
 */
ApiCore.prototype.GetVersion = () => ""

/**
 * Returns a type of the ApiCustomProperties class.
 * @memberof ApiCustomProperties
 * @returns {"customProperties"}
 * @since 9.0.0
 */
ApiCustomProperties.prototype.GetClassType = () => ""

/**
 * Adds a custom property to the document with automatic type detection.
 * @memberof ApiCustomProperties
 * @param {string} name - The custom property name.
 * @param {string | number | boolean | Date} value - The custom property value.
 * @returns {boolean} - Returns false if the type is unsupported.
 * @since 9.0.0
 */
ApiCustomProperties.prototype.Add = (name, value) => true

/**
 * Returns the value of a custom property by its name.
 * @memberof ApiCustomProperties
 * @param {string} name - The custom property name.
 * @returns {string | number | Date | boolean | null} - The value of the custom property or null if the property does not exist.
 * @since 9.0.0
 */
ApiCustomProperties.prototype.Get = (name) => ""

/**
 * @param oApiRange
 * @param oTextPr
 * @constructor
 */
function ApiRangeTextPr(oApiRange, oTextPr) {}
ApiRangeTextPr.prototype = Object.create(ApiTextPr.prototype)
ApiRangeTextPr.prototype.constructor = ApiRangeTextPr

/**
 * Class representing a presentation.
 * @constructor
 */
function ApiPresentation(oPresentation) {}

/**
 * Class representing a slide master.
 * @constructor
 */
function ApiMaster(oMaster) {}

/**
 * Class representing a slide layout.
 * @constructor
 */
function ApiLayout(oLayout) {}

/**
 * Class representing a placeholder.
 * @constructor
 */
function ApiPlaceholder(oPh) {}

/**
 * Class representing a presentation theme.
 * @constructor
 */
function ApiTheme(oThemeInfo) {}

/**
 * Class representing a theme color scheme.
 * @constructor
 */
function ApiThemeColorScheme(oClrScheme, theme) {}

/**
 * Class representing a theme format scheme.
 * @constructor
 */
function ApiThemeFormatScheme(ofmtScheme, theme) {}

/**
 * Class representing a theme font scheme.
 * @constructor
 */
function ApiThemeFontScheme(ofontScheme, theme) {}

/**
 * Class representing a slide.
 * @constructor
 */
function ApiSlide(oSlide) {}

/**
 * Class representing a notes page.
 * @constructor
 */
function ApiNotesPage(oNotes) {}

/**
 * Class representing a graphical object.
 * @constructor
 */
function ApiDrawing(Drawing) {}

/**
 * Class representing a shape.
 * @constructor
 */
function ApiShape(oShape) {}
ApiShape.prototype = Object.create(ApiDrawing.prototype)
ApiShape.prototype.constructor = ApiShape

/**
 * Class representing an image.
 * @constructor
 */
function ApiImage(oImage) {}
ApiImage.prototype = Object.create(ApiDrawing.prototype)
ApiImage.prototype.constructor = ApiImage

/**
 * Class representing a group of drawings.
 * @constructor
 */
function ApiGroup(oGroup) {}
ApiGroup.prototype = Object.create(ApiDrawing.prototype)
ApiGroup.prototype.constructor = ApiGroup

/**
 * Class representing an OLE object.
 * @constructor
 */
function ApiOleObject(OleObject) {}
ApiOleObject.prototype = Object.create(ApiDrawing.prototype)
ApiOleObject.prototype.constructor = ApiOleObject

/**
 * Class representing a table.
 * @param oGraphicFrame
 * @constructor
 */
function ApiTable(oGraphicFrame) {}
ApiTable.prototype = Object.create(ApiDrawing.prototype)
ApiTable.prototype.constructor = ApiTable

/**
 * Class representing a table row.
 * @param oTableRow
 * @constructor
 */
function ApiTableRow(oTableRow) {}

/**
 * Class representing a table cell.
 * @param oCell
 * @constructor
 */
function ApiTableCell(oCell) {}

/**
 * Twentieths of a point (equivalent to 1/1440th of an inch).
 * @typedef {number} twips
 */

/**
 * 240ths of a line.
 * @typedef {number} line240
 */

/**
 * Half-points (2 half-points = 1 point).
 * @typedef {number} hps
 */

/**
 * A numeric value from 0 to 255.
 * @typedef {number} byte
 */

/**
 * 60000th of a degree (5400000 = 90 degrees).
 * @typedef {number} PositiveFixedAngle
 */

/**
 * A border type.
 * @typedef {("none" | "single")} BorderType
 */

/**
 * Types of custom tab.
 * @typedef {("clear" | "left" | "right" | "center")} TabJc
 */

/**
 * Eighths of a point (24 eighths of a point = 3 points).
 * @typedef {number} pt_8
 */

/**
 * A point.
 * @typedef {number} pt
 */

/**
 * English measure unit. 1 mm = 36000 EMUs, 1 inch = 914400 EMUs.
 * @typedef {number} EMU
 */

/**
 * This type specifies the preset shape geometry that will be used for a shape.
 * @typedef {("accentBorderCallout1" | "accentBorderCallout2" | "accentBorderCallout3" | "accentCallout1" | "accentCallout2" | "accentCallout3" | "actionButtonBackPrevious" | "actionButtonBeginning" | "actionButtonBlank" | "actionButtonDocument" | "actionButtonEnd" | "actionButtonForwardNext" | "actionButtonHelp" | "actionButtonHome" | "actionButtonInformation" | "actionButtonMovie" | "actionButtonReturn" | "actionButtonSound" | "arc" | "bentArrow" | "bentConnector2" | "bentConnector3" | "bentConnector4" | "bentConnector5" | "bentUpArrow" | "bevel" | "blockArc" | "borderCallout1" | "borderCallout2" | "borderCallout3" | "bracePair" | "bracketPair" | "callout1" | "callout2" | "callout3" | "can" | "chartPlus" | "chartStar" | "chartX" | "chevron" | "chord" | "circularArrow" | "cloud" | "cloudCallout" | "corner" | "cornerTabs" | "cube" | "curvedConnector2" | "curvedConnector3" | "curvedConnector4" | "curvedConnector5" | "curvedDownArrow" | "curvedLeftArrow" | "curvedRightArrow" | "curvedUpArrow" | "decagon" | "diagStripe" | "diamond" | "dodecagon" | "donut" | "doubleWave" | "downArrow" | "downArrowCallout" | "ellipse" | "ellipseRibbon" | "ellipseRibbon2" | "flowChartAlternateProcess" | "flowChartCollate" | "flowChartConnector" | "flowChartDecision" | "flowChartDelay" | "flowChartDisplay" | "flowChartDocument" | "flowChartExtract" | "flowChartInputOutput" | "flowChartInternalStorage" | "flowChartMagneticDisk" | "flowChartMagneticDrum" | "flowChartMagneticTape" | "flowChartManualInput" | "flowChartManualOperation" | "flowChartMerge" | "flowChartMultidocument" | "flowChartOfflineStorage" | "flowChartOffpageConnector" | "flowChartOnlineStorage" | "flowChartOr" | "flowChartPredefinedProcess" | "flowChartPreparation" | "flowChartProcess" | "flowChartPunchedCard" | "flowChartPunchedTape" | "flowChartSort" | "flowChartSummingJunction" | "flowChartTerminator" | "foldedCorner" | "frame" | "funnel" | "gear6" | "gear9" | "halfFrame" | "heart" | "heptagon" | "hexagon" | "homePlate" | "horizontalScroll" | "irregularSeal1" | "irregularSeal2" | "leftArrow" | "leftArrowCallout" | "leftBrace" | "leftBracket" | "leftCircularArrow" | "leftRightArrow" | "leftRightArrowCallout" | "leftRightCircularArrow" | "leftRightRibbon" | "leftRightUpArrow" | "leftUpArrow" | "lightningBolt" | "line" | "lineInv" | "mathDivide" | "mathEqual" | "mathMinus" | "mathMultiply" | "mathNotEqual" | "mathPlus" | "moon" | "nonIsoscelesTrapezoid" | "noSmoking" | "notchedRightArrow" | "octagon" | "parallelogram" | "pentagon" | "pie" | "pieWedge" | "plaque" | "plaqueTabs" | "plus" | "quadArrow" | "quadArrowCallout" | "rect" | "ribbon" | "ribbon2" | "rightArrow" | "rightArrowCallout" | "rightBrace" | "rightBracket" | "round1Rect" | "round2DiagRect" | "round2SameRect" | "roundRect" | "rtTriangle" | "smileyFace" | "snip1Rect" | "snip2DiagRect" | "snip2SameRect" | "snipRoundRect" | "squareTabs" | "star10" | "star12" | "star16" | "star24" | "star32" | "star4" | "star5" | "star6" | "star7" | "star8" | "straightConnector1" | "stripedRightArrow" | "sun" | "swooshArrow" | "teardrop" | "trapezoid" | "triangle" | "upArrowCallout" | "upDownArrow" | "upDownArrow" | "upDownArrowCallout" | "uturnArrow" | "verticalScroll" | "wave" | "wedgeEllipseCallout" | "wedgeRectCallout" | "wedgeRoundRectCallout")} ShapeType
 */

/**
 * A bullet type which will be added to the paragraph in spreadsheet or presentation.
 * @typedef {("None" | "ArabicPeriod"  | "ArabicParenR"  | "RomanUcPeriod" | "RomanLcPeriod" | "AlphaLcParenR" | "AlphaLcPeriod" | "AlphaUcParenR" | "AlphaUcPeriod")} BulletType
 */

/**
 * The available text vertical alignment (used to align text in a shape with a placement for text inside it).
 * @typedef {("top" | "center" | "bottom")} VerticalTextAlign
 */

/**
 * The available color scheme identifiers.
 * @typedef {("accent1" | "accent2" | "accent3" | "accent4" | "accent5" | "accent6" | "bg1" | "bg2" | "dk1" | "dk2" | "lt1" | "lt2" | "tx1" | "tx2")} SchemeColorId
 */

/**
 * The available preset color names.
 * @typedef {("aliceBlue" | "antiqueWhite" | "aqua" | "aquamarine" | "azure" | "beige" | "bisque" | "black" | "blanchedAlmond" | "blue" | "blueViolet" | "brown" | "burlyWood" | "cadetBlue" | "chartreuse" | "chocolate" | "coral" | "cornflowerBlue" | "cornsilk" | "crimson" | "cyan" | "darkBlue" | "darkCyan" | "darkGoldenrod" | "darkGray" | "darkGreen" | "darkGrey" | "darkKhaki" | "darkMagenta" | "darkOliveGreen" | "darkOrange" | "darkOrchid" | "darkRed" | "darkSalmon" | "darkSeaGreen" | "darkSlateBlue" | "darkSlateGray" | "darkSlateGrey" | "darkTurquoise" | "darkViolet" | "deepPink" | "deepSkyBlue" | "dimGray" | "dimGrey" | "dkBlue" | "dkCyan" | "dkGoldenrod" | "dkGray" | "dkGreen" | "dkGrey" | "dkKhaki" | "dkMagenta" | "dkOliveGreen" | "dkOrange" | "dkOrchid" | "dkRed" | "dkSalmon" | "dkSeaGreen" | "dkSlateBlue" | "dkSlateGray" | "dkSlateGrey" | "dkTurquoise" | "dkViolet" | "dodgerBlue" | "firebrick" | "floralWhite" | "forestGreen" | "fuchsia" | "gainsboro" | "ghostWhite" | "gold" | "goldenrod" | "gray" | "green" | "greenYellow" | "grey" | "honeydew" | "hotPink" | "indianRed" | "indigo" | "ivory" | "khaki" | "lavender" | "lavenderBlush" | "lawnGreen" | "lemonChiffon" | "lightBlue" | "lightCoral" | "lightCyan" | "lightGoldenrodYellow" | "lightGray" | "lightGreen" | "lightGrey" | "lightPink" | "lightSalmon" | "lightSeaGreen" | "lightSkyBlue" | "lightSlateGray" | "lightSlateGrey" | "lightSteelBlue" | "lightYellow" | "lime" | "limeGreen" | "linen" | "ltBlue" | "ltCoral" | "ltCyan" | "ltGoldenrodYellow" | "ltGray" | "ltGreen" | "ltGrey" | "ltPink" | "ltSalmon" | "ltSeaGreen" | "ltSkyBlue" | "ltSlateGray" | "ltSlateGrey" | "ltSteelBlue" | "ltYellow" | "magenta" | "maroon" | "medAquamarine" | "medBlue" | "mediumAquamarine" | "mediumBlue" | "mediumOrchid" | "mediumPurple" | "mediumSeaGreen" | "mediumSlateBlue" | "mediumSpringGreen" | "mediumTurquoise" | "mediumVioletRed" | "medOrchid" | "medPurple" | "medSeaGreen" | "medSlateBlue" | "medSpringGreen" | "medTurquoise" | "medVioletRed" | "midnightBlue" | "mintCream" | "mistyRose" | "moccasin" | "navajoWhite" | "navy" | "oldLace" | "olive" | "oliveDrab" | "orange" | "orangeRed" | "orchid" | "paleGoldenrod" | "paleGreen" | "paleTurquoise" | "paleVioletRed" | "papayaWhip" | "peachPuff" | "peru" | "pink" | "plum" | "powderBlue" | "purple" | "red" | "rosyBrown" | "royalBlue" | "saddleBrown" | "salmon" | "sandyBrown" | "seaGreen" | "seaShell" | "sienna" | "silver" | "skyBlue" | "slateBlue" | "slateGray" | "slateGrey" | "snow" | "springGreen" | "steelBlue" | "tan" | "teal" | "thistle" | "tomato" | "turquoise" | "violet" | "wheat" | "white" | "whiteSmoke" | "yellow" | "yellowGreen")} PresetColor
 */

/**
 * Possible values for the position of chart tick labels (either horizontal or vertical).
 * <b>"none"</b> - not display the selected tick labels.
 * <b>"nextTo"</b> - set the position of the selected tick labels next to the main label.
 * <b>"low"</b> - set the position of the selected tick labels in the part of the chart with lower values.
 * <b>"high"</b> - set the position of the selected tick labels in the part of the chart with higher values.
 * @typedef {("none" | "nextTo" | "low" | "high")} TickLabelPosition
 */

/**
 * The type of a fill which uses an image as a background.
 * <b>"tile"</b> - if the image is smaller than the shape which is filled, the image will be tiled all over the created shape surface.
 * <b>"stretch"</b> - if the image is smaller than the shape which is filled, the image will be stretched to fit the created shape surface.
 * @typedef {"tile" | "stretch"} BlipFillType
 */

/**
 * The available preset patterns which can be used for the fill.
 * @typedef {"cross" | "dashDnDiag" | "dashHorz" | "dashUpDiag" | "dashVert" | "diagBrick" | "diagCross" | "divot" | "dkDnDiag" | "dkHorz" | "dkUpDiag" | "dkVert" | "dnDiag" | "dotDmnd" | "dotGrid" | "horz" | "horzBrick" | "lgCheck" | "lgConfetti" | "lgGrid" | "ltDnDiag" | "ltHorz" | "ltUpDiag" | "ltVert" | "narHorz" | "narVert" | "openDmnd" | "pct10" | "pct20" | "pct25" | "pct30" | "pct40" | "pct5" | "pct50" | "pct60" | "pct70" | "pct75" | "pct80" | "pct90" | "plaid" | "shingle" | "smCheck" | "smConfetti" | "smGrid" | "solidDmnd" | "sphere" | "trellis" | "upDiag" | "vert" | "wave" | "wdDnDiag" | "wdUpDiag" | "weave" | "zigZag"} PatternType
 */

/**
 * The available types of tick mark appearance.
 * @typedef {("cross" | "in" | "none" | "out")} TickMark
 */

/**
 * Text transform type.
 * @typedef {("textArchDown" | "textArchDownPour" | "textArchUp" | "textArchUpPour" | "textButton" | "textButtonPour" | "textCanDown"
 * | "textCanUp" | "textCascadeDown" | "textCascadeUp" | "textChevron" | "textChevronInverted" | "textCircle" | "textCirclePour"
 * | "textCurveDown" | "textCurveUp" | "textDeflate" | "textDeflateBottom" | "textDeflateInflate" | "textDeflateInflateDeflate" | "textDeflateTop"
 * | "textDoubleWave1" | "textFadeDown" | "textFadeLeft" | "textFadeRight" | "textFadeUp" | "textInflate" | "textInflateBottom" | "textInflateTop"
 * | "textPlain" | "textRingInside" | "textRingOutside" | "textSlantDown" | "textSlantUp" | "textStop" | "textTriangle" | "textTriangleInverted"
 * | "textWave1" | "textWave2" | "textWave4" | "textNoShape")} TextTransform
 */

/**
 * Axis position in the chart.
 * @typedef {("top" | "bottom" | "right" | "left")} AxisPos
 */

/**
 * Standard numeric format.
 * @typedef {("General" | "0" | "0.00" | "#,##0" | "#,##0.00" | "0%" | "0.00%" |
 * "0.00E+00" | "# ?/?" | "# ??/??" | "m/d/yyyy" | "d-mmm-yy" | "d-mmm" | "mmm-yy" | "h:mm AM/PM" |
 * "h:mm:ss AM/PM" | "h:mm" | "h:mm:ss" | "m/d/yyyy h:mm" | "#,##0_\);(#,##0)" | "#,##0_\);\[Red\]\(#,##0)" |
 * "#,##0.00_\);\(#,##0.00\)" | "#,##0.00_\);\[Red\]\(#,##0.00\)" | "mm:ss" | "[h]:mm:ss" | "mm:ss.0" | "##0.0E+0" | "@")} NumFormat
 */

/**
 * @typedef {("body" | "chart" | "clipArt" | "ctrTitle" | "diagram" | "date" | "footer" | "header" | "media" | "object" | "picture" | "sldImage" | "sldNumber" | "subTitle" | "table" | "title")} PlaceholderType - Available placeholder types.
 */

/**
 * @typedef {("blank" | "chart" | "chartAndTx" | "clipArtAndTx" | "clipArtAndVertTx" | "cust" | "dgm" | "fourObj" | "mediaAndTx" | "obj" | "objAndTwoObj" | "objAndTx" | "objOnly" | "objOverTx" | "objTx" | "picTx" | "secHead" | "tbl" | "title" | "titleOnly" | "twoColTx" | "twoObj" | "twoObjAndObj" | "twoObjAndTx" | "twoObjOverTx" | "twoTxTwoObj" | "tx" | "txAndChart" | "txAndClipArt" | "txAndMedia" | "txAndObj" | "txAndTwoObj" | "txOverObj" | "vertTitleAndTx" | "vertTitleAndTxOverChart" | "vertTx")} LayoutType - Available layout types.
 */

/**
 * Any valid drawing element.
 * @typedef {(ApiShape | ApiImage | ApiGroup | ApiOleObject | ApiTable | ApiChart )} Drawing
 */

/**
 * Available drawing element for grouping.
 * @typedef {(ApiShape | ApiGroup | ApiImage | ApiChart)} DrawingForGroup
 */

/**
 * Any valid element which can be added to the document structure.
 * @typedef {(ApiParagraph)} DocumentElement
 */

/**
 * The types of elements that can be added to the paragraph structure.
 * @typedef {(ApiUnsupported | ApiRun | ApiHyperlink)} ParagraphContent
 */

/**
 * The 1000th of a percent (100000 = 100%).
 * @typedef {number} PositivePercentage
 */

/**
 * Represents the type of objects in a selection.
 * @typedef {("none" | "shapes" | "slides" | "text")} SelectionType - Available selection types.
 *
 */

/**
 * Returns the main presentation.
 * @memberof ApiInterface
 * @returns {ApiPresentation}
 */
ApiInterface.prototype.GetPresentation = () => new ApiPresentation()

/**
 * Creates a new slide master.
 * @memberof ApiInterface
 * @param {ApiTheme} [oTheme = ApiPresentation.GetMaster(0).GetTheme()] - The presentation theme object.
 * @returns {ApiMaster} - returns null if presentation theme doesn't exist.
 */
ApiInterface.prototype.CreateMaster = (oTheme) => new ApiMaster()

/**
 * Creates a new slide layout and adds it to the slide master if it is specified.
 * @memberof ApiInterface
 * @param {ApiMaster} [oMaster = null] - Parent slide master.
 * @returns {ApiLayout}
 */
ApiInterface.prototype.CreateLayout = (oMaster) => new ApiLayout()

/**
 * Creates a new placeholder.
 * @memberof ApiInterface
 * @param {string} sType - The placeholder type ("body", "chart", "clipArt", "ctrTitle", "diagram", "date", "footer", "header", "media", "object", "picture", "sldImage", "sldNumber", "subTitle", "table", "title").
 * @returns {ApiPlaceholder}
 */
ApiInterface.prototype.CreatePlaceholder = (sType) => new ApiPlaceholder()

/**
 * Creates a new presentation theme.
 * @memberof ApiInterface
 * @param {string} sName - Theme name.
 * @param {ApiMaster} oMaster - Slide master. Required parameter.
 * @param {ApiThemeColorScheme} oClrScheme - Theme color scheme. Required parameter.
 * @param {ApiThemeFormatScheme} oFormatScheme - Theme format scheme. Required parameter.
 * @param {ApiThemeFontScheme} oFontScheme - Theme font scheme. Required parameter.
 * @returns {ApiTheme | null}
 */
ApiInterface.prototype.CreateTheme = (sName, oMaster, oClrScheme, oFormatScheme, oFontScheme) =>
  new ApiTheme()

/**
 * Creates a new theme color scheme.
 * @memberof ApiInterface
 * @param {(ApiUniColor[] | ApiRGBColor[])} arrColors - Set of colors which are referred to as a color scheme.
 * The color scheme is responsible for defining a list of twelve colors.
 * The array should contain a sequence of colors: 2 dark, 2 light, 6 primary, a color for a hyperlink and a color for the followed hyperlink.
 * @param {string} sName - Theme color scheme name.
 * @returns {ApiThemeColorScheme}
 */
ApiInterface.prototype.CreateThemeColorScheme = (arrColors, sName) => new ApiThemeColorScheme()

/**
 * Creates a new theme format scheme.
 * @memberof ApiInterface
 * @param {ApiFill[]} arrFill - This array contains the fill styles. It should be consist of subtle, moderate and intense fills.
 * @param {ApiFill[]} arrBgFill - This array contains the background fill styles. It should be consist of subtle, moderate and intense fills.
 * @param {ApiStroke[]} arrLine - This array contains the line styles. It should be consist of subtle, moderate and intense lines.
 * @param {string} sName - Theme format scheme name.
 * @returns {ApiThemeFormatScheme}
 */
ApiInterface.prototype.CreateThemeFormatScheme = (arrFill, arrBgFill, arrLine, sName) =>
  new ApiThemeFormatScheme()

/**
 * Creates a new theme font scheme.
 * @memberof ApiInterface
 * @param {string} mjLatin - The major theme font applied to the latin text.
 * @param {string} mjEa - The major theme font applied to the east asian text.
 * @param {string} mjCs - The major theme font applied to the complex script text.
 * @param {string} mnLatin - The minor theme font applied to the latin text.
 * @param {string} mnEa - The minor theme font applied to the east asian text.
 * @param {string} mnCs - The minor theme font applied to the complex script text.
 * @param {string} sName - Theme font scheme name.
 * @returns {ApiThemeFontScheme}
 */
ApiInterface.prototype.CreateThemeFontScheme = (mjLatin, mjEa, mjCs, mnLatin, mnEa, mnCs, sName) =>
  new ApiThemeFontScheme()

/**
 * Creates a new slide.
 * @memberof ApiInterface
 * @returns {ApiSlide}
 */
ApiInterface.prototype.CreateSlide = () => new ApiSlide()

/**
 * Creates an image with the parameters specified.
 * @memberof ApiInterface
 * @param {string} sImageSrc - The image source where the image to be inserted should be taken from (currently,
 * only internet URL or Base64 encoded images are supported).
 * @param {EMU} nWidth - The image width in English measure units.
 * @param {EMU} nHeight - The image height in English measure units.
 * @returns {ApiImage}
 */
ApiInterface.prototype.CreateImage = (sImageSrc, nWidth, nHeight) => new ApiImage()

/**
 * Creates an OLE object with the parameters specified.
 * @memberof ApiInterface
 * @param {string} sImageSrc - The image source where the image to be inserted should be taken from (currently, only internet URL or Base64 encoded images are supported).
 * @param {EMU} nWidth - The OLE object width in English measure units.
 * @param {EMU} nHeight - The OLE object height in English measure units.
 * @param {string} sData - The OLE object string data.
 * @param {string} sAppId - The application ID associated with the current OLE object.
 * @returns {ApiOleObject}
 */
ApiInterface.prototype.CreateOleObject = (sImageSrc, nWidth, nHeight, sData, sAppId) =>
  new ApiOleObject()

/**
 * Creates a shape with the parameters specified.
 * @memberof ApiInterface
 * @param {ShapeType} [sType="rect"] - The shape type which specifies the preset shape geometry.
 * @param {EMU} [nWidth = 914400] - The shape width in English measure units.
 * @param {EMU} [nHeight = 914400] - The shape height in English measure units.
 * @param {ApiFill} [oFill    = Api.CreateNoFill()] - The color or pattern used to fill the shape.
 * @param {ApiStroke} [oStroke    = Api.CreateStroke(0, Api.CreateNoFill())] - The stroke used to create the element shadow.
 * @returns {ApiShape}
 */
ApiInterface.prototype.CreateShape = (sType, nWidth, nHeight, oFill, oStroke) => new ApiShape()

/**
 * Creates a chart with the parameters specified.
 * @memberof ApiInterface
 * @param {ChartType} [sType="bar"] - The chart type used for the chart display.
 * @param {number[][]} aSeries - The array of the data used to build the chart from.
 * @param {number[] | string[]} aSeriesNames - The array of the names (the source table column names) used for the data which the chart will be build from.
 * @param {number[] | string[]} aCatNames - The array of the names (the source table row names) used for the data which the chart will be build from.
 * @param {EMU} nWidth - The chart width in English measure units.
 * @param {EMU} nHeight - The chart height in English measure units.
 * @param {number} nStyleIndex - The chart color style index (can be <b>1 - 48</b>, as described in OOXML specification).
 * @param {NumFormat[] | String[]} aNumFormats - Numeric formats which will be applied to the series (can be custom formats).
 * The default numeric format is "General".
 * @returns {ApiChart}
 */
ApiInterface.prototype.CreateChart = (
  sType,
  aSeries,
  aSeriesNames,
  aCatNames,
  nWidth,
  nHeight,
  nStyleIndex,
  aNumFormats,
) => new ApiChart()

/**
 * Creates a group of drawings.
 * @memberof ApiInterface
 * @param {DrawingForGroup[]} aDrawings - An array of drawings to group.
 * @returns {ApiGroup}
 * @since 8.3.0
 */
ApiInterface.prototype.CreateGroup = (aDrawings) => new ApiGroup()

/**
 * Creates a table.
 * @memberof ApiInterface
 * @param nCols - Number of columns.
 * @param nRows - Number of rows.
 * @returns {ApiTable}
 */
ApiInterface.prototype.CreateTable = (nCols, nRows) => new ApiTable()

/**
 * Creates a new paragraph.
 * @memberof ApiInterface
 * @returns {ApiParagraph}
 */
ApiInterface.prototype.CreateParagraph = () => new ApiParagraph()

/**
 * Saves changes to the specified document.
 * @memberof ApiInterface
 */
ApiInterface.prototype.Save = () => {}

/**
 * Creates a Text Art object with the parameters specified.
 * @memberof ApiInterface
 * @param {ApiTextPr} [oTextPr=Api.CreateTextPr()] - The text properties.
 * @param {string} [sText="Your text here"] - The text for the Text Art object.
 * @param {TextTransform} [sTransform="textNoShape"] - Text transform type.
 * @param {ApiFill} [oFill=Api.CreateNoFill()] - The color or pattern used to fill the Text Art object.
 * @param {ApiStroke} [oStroke=Api.CreateStroke(0, Api.CreateNoFill())] - The stroke used to create the Text Art object shadow.
 * @param {number} [nRotAngle=0] - Rotation angle.
 * @param {EMU} [nWidth=1828800] - The Text Art width measured in English measure units.
 * @param {EMU} [nHeight=1828800] - The Text Art heigth measured in English measure units.
 * @param {EMU} [nIndLeft=ApiPresentation.GetWidth() / 2] - The Text Art left side indentation value measured in English measure units.
 * @param {EMU} [nIndTop=ApiPresentation.GetHeight() / 2] - The Text Art top side indentation value measured in English measure units.
 * @returns {ApiDrawing}
 */
ApiInterface.prototype.CreateWordArt = (
  oTextPr,
  sText,
  sTransform,
  oFill,
  oStroke,
  nRotAngle,
  nWidth,
  nHeight,
  nIndLeft,
  nIndTop,
) => new ApiDrawing()

/**
 * Converts the specified JSON object into the Document Builder object of the corresponding type.
 * @memberof ApiInterface
 * @param {JSON} sMessage - The JSON object to convert.
 */
ApiInterface.prototype.FromJSON = (sMessage) => {}

/**
 * Returns the selection from the current presentation.
 * @memberof ApiInterface
 * @returns {ApiSelection}
 * @since 8.3.0
 */
ApiInterface.prototype.GetSelection = () => new ApiSelection()

/**
 * Subscribes to the specified event and calls the callback function when the event fires.
 * @function
 * @memberof ApiInterface
 * @param {string} eventName - The event name.
 * @param {function} callback - Function to be called when the event fires.
 */
ApiInterface.prototype["attachEvent"] = ApiInterface.prototype.attachEvent
{
}

/**
 * Unsubscribes from the specified event.
 * @function
 * @memberof ApiInterface
 * @param {string} eventName - The event name.
 */
ApiInterface.prototype["detachEvent"] = ApiInterface.prototype.detachEvent
{
}

/**
 * Returns a type of the ApiPresentation class.
 * @returns {"presentation"}
 */
ApiPresentation.prototype.GetClassType = () => ""

/**
 * Returns the index for the current slide.
 * @memberof ApiPresentation
 * @returns {number}
 */
ApiPresentation.prototype.GetCurSlideIndex = () => 0

/**
 * Returns a slide by its position in the presentation.
 * @memberof ApiPresentation
 * @param {number} nIndex - The slide number (position) in the presentation.
 * @returns {ApiSlide}
 */
ApiPresentation.prototype.GetSlideByIndex = (nIndex) => new ApiSlide()

/**
 * Returns the current slide.
 * @memberof ApiPresentation
 * @returns {ApiSlide}
 */
ApiPresentation.prototype.GetCurrentSlide = () => new ApiSlide()

/**
 * Returns the current visible slide.
 * @memberof ApiPresentation
 * @returns {ApiSlide | null} - Returns null if the current slide is not found or not visible.
 * @since 9.0.0
 */
ApiPresentation.prototype.GetCurrentVisibleSlide = () => new ApiSlide()

/**
 * Appends a new slide to the end of the presentation.
 * @memberof ApiPresentation
 * @param {ApiSlide} oSlide - The slide created using the {@link Api#CreateSlide} method.
 * @param {?number} nIndex - Index of the slide to be added. If not specified, the slide will be added to the end of the presentation.
 */
ApiPresentation.prototype.AddSlide = (oSlide, nIndex) => {}

/**
 * Sets the size to the current presentation.
 * @memberof ApiPresentation
 * @param {EMU} nWidth - The presentation width in English measure units.
 * @param {EMU} nHeight - The presentation height in English measure units.
 */
ApiPresentation.prototype.SetSizes = (nWidth, nHeight) => {}

/**
 * Creates a new history point.
 * @memberof ApiPresentation
 */
ApiPresentation.prototype.CreateNewHistoryPoint = () => {}

/**
 * Replaces the current image with an image specified.
 * @memberof ApiPresentation
 * @param {string} sImageUrl - The image source where the image to be inserted should be taken from (currently, only internet URL or Base64 encoded images are supported).
 * @param {EMU} Width - The image width in English measure units.
 * @param {EMU} Height - The image height in English measure units.
 */
ApiPresentation.prototype.ReplaceCurrentImage = (sImageUrl, Width, Height) => {}

/**
 * Specifies the languages which will be used to check spelling and grammar (if requested).
 * @memberof ApiPresentation
 * @param {string} sLangId - The possible value for this parameter is a language identifier as defined by
 * RFC 4646/BCP 47. Example: "en-CA".
 * @returns {boolean}
 */
ApiPresentation.prototype.SetLanguage = (sLangId) => true

/**
 * Returns a number of slides.
 * @returns {number}
 */
ApiPresentation.prototype.GetSlidesCount = () => 0

/**
 * Returns an array of all slides from the current presentation.
 * @returns {ApiSlide[]}
 * @since 8.3.0
 */
ApiPresentation.prototype.GetAllSlides = () => [new ApiSlide()]

/**
 * Returns a number of slide masters.
 * @returns {number}
 */
ApiPresentation.prototype.GetMastersCount = () => 0

/**
 * Returns an array of all slide masters from the current presentation.
 * @returns {ApiMaster[]}
 * @since 8.3.0
 */
ApiPresentation.prototype.GetAllSlideMasters = () => [new ApiMaster()]

/**
 * Returns a slide master by its position in the presentation.
 * @param {number} nPos - Slide master position in the presentation
 * @returns {ApiMaster | null} - returns null if position is invalid.
 */
ApiPresentation.prototype.GetMaster = (nPos) => new ApiMaster()

/**
 * Adds the slide master to the presentation slide masters collection.
 * @param {number} [nPos    = ApiPresentation.GetMastersCount()]
 * @param {ApiMaster} oApiMaster - The slide master to be added.
 * @returns {boolean} - return false if position is invalid or oApiMaster doesn't exist.
 */
ApiPresentation.prototype.AddMaster = (nPos, oApiMaster) => true

/**
 * Applies a theme to all the slides in the presentation.
 * @param {ApiTheme} oApiTheme - The presentation theme.
 * @returns {boolean} - returns false if param isn't theme or presentation doesn't exist.
 */
ApiPresentation.prototype.ApplyTheme = (oApiTheme) => true

/**
 * Removes a range of slides from the presentation.
 * Deletes all the slides from the presentation if no parameters are specified.
 * @memberof ApiPresentation
 * @param {Number} [nStart=0] - The starting position for the deletion range.
 * @param {Number} [nCount=ApiPresentation.GetSlidesCount()] - The number of slides to delete.
 * @returns {boolean}
 */
ApiPresentation.prototype.RemoveSlides = (nStart, nCount) => true

/**
 * Returns the presentation width in English measure units.
 * @memberof ApiPresentation
 * @returns {EMU}
 */
ApiPresentation.prototype.GetWidth = () => new EMU()

/**
 * Returns the presentation height in English measure units.
 * @memberof ApiPresentation
 * @returns {EMU}
 */
ApiPresentation.prototype.GetHeight = () => new EMU()

/**
 * Converts the ApiPresentation object into the JSON object.
 * @memberof ApiPresentation
 * @param {boolean} [bWriteTableStyles=false] - Specifies whether to write used table styles to the JSON object (true) or not (false).
 * @returns {JSON}
 */
ApiPresentation.prototype.ToJSON = (bWriteTableStyles) => new JSON()

/**
 * Converts the slides from the current ApiPresentation object into the JSON objects.
 * @memberof ApiPresentation
 * @param {boolean} [nStart=0] - The index to the start slide.
 * @param {boolean} [nStart=ApiPresentation.GetSlidesCount() - 1] - The index to the end slide.
 * @param {boolean} [bWriteLayout=false] - Specifies if the slide layout will be written to the JSON object or not.
 * @param {boolean} [bWriteMaster=false] - Specifies if the slide master will be written to the JSON object or not (bWriteMaster is false if bWriteLayout === false).
 * @param {boolean} [bWriteAllMasLayouts=false] - Specifies if all child layouts from the slide master will be written to the JSON object or not.
 * @param {boolean} [bWriteTableStyles=false] - Specifies whether to write used table styles to the JSON object (true) or not (false).
 * @returns {JSON[]}
 */
ApiPresentation.prototype.SlidesToJSON = (
  nStart,
  nEnd,
  bWriteLayout,
  bWriteMaster,
  bWriteAllMasLayouts,
  bWriteTableStyles,
) => [new JSON()]

/**
 * Returns all comments from the current presentation.
 * @memberof ApiPresentation
 * @returns {ApiComment[]}
 */
ApiPresentation.prototype.GetAllComments = () => [new ApiComment()]

/**
 * Private method to collect all objects of a specific type from the presentation (OleObjects, Charts, Shapes, Images).
 * Calls 'getObjectsMethod' method on each slide, master and layout to get the objects.
 */
ApiPresentation.prototype._collectAllObjects = (getObjectsMethod) => {}

/**
 * Returns an array with all the OLE objects from the current presentation.
 * @memberof ApiPresentation
 * @returns {ApiOleObject[]}
 * @since 9.0.0
 */
ApiPresentation.prototype.GetAllOleObjects = () => [new ApiOleObject()]

/**
 * Returns an array with all tables from the current presentation (including slide masters and slide layouts).
 *
 * @memberof ApiPresentation
 * @returns {ApiTable[]}
 */
ApiPresentation.prototype.GetAllTables = () => [new ApiTable()]

/**
 * Returns an array with all the chart objects from the current presentation.
 * @memberof ApiPresentation
 * @returns {ApiChart[]}
 * @since 9.0.0
 */
ApiPresentation.prototype.GetAllCharts = () => [new ApiChart()]

/**
 * Returns an array with all the shape objects from the current presentation.
 * @memberof ApiPresentation
 * @returns {ApiShape[]}
 * @since 9.0.0
 */
ApiPresentation.prototype.GetAllShapes = () => [new ApiShape()]

/**
 * Returns an array with all the image objects from the current presentation.
 * @memberof ApiPresentation
 * @returns {ApiImage[]}
 * @since 9.0.0
 */
ApiPresentation.prototype.GetAllImages = () => [new ApiImage()]

/**
 * Returns an array with all the drawing objects from the current presentation.
 * @memberof ApiPresentation
 * @returns {Drawing[]}
 * @since 9.0.0
 */
ApiPresentation.prototype.GetAllDrawings = () => [new Drawing()]

/**
 * Returns the document information:
 * <b>Application</b> - the application the document has been created with.
 * <b>CreatedRaw</b> - the date and time when the file was created.
 * <b>Created</b> - the parsed date and time when the file was created.
 * <b>LastModifiedRaw</b> - the date and time when the file was last modified.
 * <b>LastModified</b> - the parsed date and time when the file was last modified.
 * <b>LastModifiedBy</b> - the name of the user who has made the latest change to the document.
 * <b>Authors</b> - the persons who has created the file.
 * <b>Title</b> - this property allows you to simplify your documents classification.
 * <b>Tags</b> - this property allows you to simplify your documents classification.
 * <b>Subject</b> - this property allows you to simplify your documents classification.
 * <b>Comment</b> - this property allows you to simplify your documents classification.
 * @memberof ApiPresentation
 * @returns {object}
 */
ApiPresentation.prototype.GetDocumentInfo = () => new object()

/**
 * Returns the core properties interface for the current presentation.
 * This method is used to view or modify standard metadata such as title, author, and keywords.
 * @memberof ApiPresentation
 * @returns {ApiCore}
 * @since 9.0.0
 */
ApiPresentation.prototype.GetCore = () => new ApiCore()

/**
 * Returns the custom properties from the current presentation.
 * @memberof ApiPresentation
 * @returns {ApiCustomProperties}
 * @since 9.0.0
 */
ApiPresentation.prototype.GetCustomProperties = () => new ApiCustomProperties()

/**
 * Adds a math equation to the current presentation.
 * @memberof ApiPresentation
 * @param {string} sText - The math equation text.
 * @param {string} sFormat - The math equation format. Possible values are "unicode", "latex" and "mathml".
 * @returns {boolean}
 * @since 9.0.0
 */
ApiPresentation.prototype.AddMathEquation = (sText, sFormat) => true

/**
 * Retrieves the custom XML manager associated with the presentation.
 * This manager allows manipulation and access to custom XML parts within the presentation.
 * @memberof ApiPresentation
 * @since 9.1.0
 * @returns {ApiCustomXmlParts|null} Returns an instance of ApiCustomXmlParts if the custom XML manager exists, otherwise returns null.
 */
ApiPresentation.prototype.GetCustomXmlParts = () => new ApiCustomXmlParts()

/**
 * Returns the type of the ApiMaster class.
 * @returns {"master"}
 */
ApiMaster.prototype.GetClassType = () => ""

/**
 * Returns all layouts from the slide master.
 * @returns {ApiLayout[]} - Returns an empty array if the slide master doesn't have layouts.
 * @since 9.0.0
 */
ApiMaster.prototype.GetAllLayouts = () => [new ApiLayout()]

/**
 * Returns a layout of the specified slide master by its position.
 * @param {number} nPos - Layout position.
 * @returns {ApiLayout | null} - returns null if position is invalid.
 */
ApiMaster.prototype.GetLayout = (nPos) => new ApiLayout()

/**
 * Returns a layout of the specified slide master by its position.
 * @param {LayoutType} sType - Layout position.
 * @returns {ApiLayout | null} - returns null if position is invalid.
 */
ApiMaster.prototype.GetLayoutByType = (sType) => new ApiLayout()

/**
 * Adds a layout to the specified slide master.
 * @param {number} [nPos = ApiMaster.GetLayoutsCount()] - Position where a layout will be added.
 * @param {ApiLayout} oLayout - A layout to be added.
 * @returns {boolean} - returns false if oLayout isn't a layout.
 */
ApiMaster.prototype.AddLayout = (nPos, oLayout) => true

/**
 * Removes the layouts from the current slide master.
 * @param {number} nPos - Position from which a layout will be deleted.
 * @param {number} [nCount = 1] - Number of layouts to delete.
 * @returns {boolean} - return false if position is invalid.
 */
ApiMaster.prototype.RemoveLayout = (nPos, nCount) => true

/**
 * Returns a number of layout objects.
 * @returns {number}
 */
ApiMaster.prototype.GetLayoutsCount = () => 0

/**
 * Adds an object (image, shape or chart) to the current slide master.
 * @memberof ApiMaster
 * @param {ApiDrawing} oDrawing - The object which will be added to the current slide master.
 * @returns {boolean} - returns false if slide master doesn't exist.
 */
ApiMaster.prototype.AddObject = (oDrawing) => true

/**
 * Removes objects (image, shape or chart) from the current slide master.
 * @memberof ApiMaster
 * @param {number} nPos - Position from which the object will be deleted.
 * @param {number} [nCount = 1] - Number of objects to delete.
 * @returns {boolean} - returns false if master doesn't exist or position is invalid or master hasn't objects.
 */
ApiMaster.prototype.RemoveObject = (nPos, nCount) => true

/**
 * Sets the background to the current slide master.
 * @memberOf ApiMaster
 * @param {ApiFill} oApiFill - The color or pattern used to fill the presentation slide master background.
 * @returns {boolean}
 */
ApiMaster.prototype.SetBackground = (oApiFill) => true

/**
 * Clears the slide master background.
 * @returns {boolean} - return false if slide master doesn't exist.
 */
ApiMaster.prototype.ClearBackground = () => true

/**
 * Creates a copy of the specified slide master object.
 * @returns {ApiMaster | null} - returns new ApiMaster object that represents the copy of slide master.
 * Returns null if slide doesn't exist.
 */
ApiMaster.prototype.Copy = () => new ApiMaster()

/**
 * Creates a duplicate of the specified slide master object, adds the new slide master to the slide masters collection.
 * @param {number} [nPos    = ApiPresentation.GetMastersCount()] - Position where the new slide master will be added.
 * @returns {ApiMaster | null} - returns new ApiMaster object that represents the copy of slide master.
 * Returns null if slide master doesn't exist or is not in the presentation.
 */
ApiMaster.prototype.Duplicate = (nPos) => new ApiMaster()

/**
 * Deletes the specified object from the parent if it exists.
 * @returns {boolean} - return false if master doesn't exist or is not in the presentation.
 */
ApiMaster.prototype.Delete = () => true

/**
 * Returns a theme of the slide master.
 * @returns {ApiTheme | null} - returns null if theme doesn't exist.
 */
ApiMaster.prototype.GetTheme = () => new ApiTheme()

/**
 * Sets a theme to the slide master.
 * Sets a copy of the theme object.
 * @param {ApiTheme} oTheme - Presentation theme.
 * @returns {boolean} - return false if oTheme isn't a theme or slide master doesn't exist.
 */
ApiMaster.prototype.SetTheme = (oTheme) => true

/**
 * Returns an array with all the drawing objects from the slide master.
 * @returns {Drawing[]}
 */
ApiMaster.prototype.GetAllDrawings = () => [new Drawing()]

/**
 * Returns an array with all the shape objects from the slide master.
 * @returns {ApiShape[]}
 */
ApiMaster.prototype.GetAllShapes = () => [new ApiShape()]

/**
 * Returns an array with all the image objects from the slide master.
 * @returns {ApiImage[]}
 */
ApiMaster.prototype.GetAllImages = () => [new ApiImage()]

/**
 * Returns an array with all the chart objects from the slide master.
 * @returns {ApiChart[]}
 */
ApiMaster.prototype.GetAllCharts = () => [new ApiChart()]

/**
 * Returns an array with all the OLE objects from the slide master.
 * @returns {ApiOleObject[]}
 */
ApiMaster.prototype.GetAllOleObjects = () => [new ApiOleObject()]

/**
 * Returns an array with all tables from the slide master.
 *
 * @returns {ApiTable[]}
 */
ApiMaster.prototype.GetAllTables = () => [new ApiTable()]

/**
 * Converts the ApiMaster object into the JSON object.
 * @memberof ApiMaster
 * @param {boolean} [bWriteTableStyles=false] - Specifies whether to write used table styles to the JSON object (true) or not (false).
 * @returns {JSON}
 */
ApiMaster.prototype.ToJSON = (bWriteTableStyles) => new JSON()

/**
 * Returns an array of drawings by the specified placeholder type.
 * @memberof ApiMaster
 * @param {PlaceholderType} sType - The placeholder type.
 * @returns {Drawing[]}
 * @since 8.2.0
 */
ApiMaster.prototype.GetDrawingsByPlaceholderType = (sType) => [new Drawing()]

/**
 * Groups an array of drawings in the current slide master.
 * @memberof ApiMaster
 * @param {DrawingForGroup[]} aDrawings - An array of drawings to group.
 * @returns {ApiGroup}
 * @since 8.3.0
 */
ApiMaster.prototype.GroupDrawings = (aDrawings) => new ApiGroup()

/**
 * Returns the type of the ApiLayout class.
 * @returns {"layout"}
 */
ApiLayout.prototype.GetClassType = () => ""

/**
 * Sets a name to the current layout.
 * @param {string} sName - Layout name to be set.
 * @returns {boolean}
 */
ApiLayout.prototype.SetName = (sName) => true

/**
 * Returns a type if the current layout.
 * @returns {boolean}
 */
ApiLayout.prototype.GetLayoutType = () => true

/**
 * Returns a name of the current layout.
 * @returns {string}
 * @since 8.3.0
 */
ApiLayout.prototype.GetName = () => ""

/**
 * Adds an object (image, shape or chart) to the current slide layout.
 * @memberof ApiLayout
 * @param {ApiDrawing} oDrawing - The object which will be added to the current slide layout.
 * @returns {boolean} - returns false if slide layout doesn't exist.
 */
ApiLayout.prototype.AddObject = (oDrawing) => true

/**
 * Removes objects (image, shape or chart) from the current slide layout.
 * @memberof ApiLayout
 * @param {number} nPos - Position from which the object will be deleted.
 * @param {number} [nCount = 1] - The number of elements to delete.
 * @returns {boolean} - returns false if layout doesn't exist or position is invalid or layout hasn't objects.
 */
ApiLayout.prototype.RemoveObject = (nPos, nCount) => true

/**
 * Sets the background to the current slide layout.
 * @memberOf ApiLayout
 * @param {ApiFill} oApiFill - The color or pattern used to fill the presentation slide layout background.\
 * @returns {boolean}
 */
ApiLayout.prototype.SetBackground = (oApiFill) => true

/**
 * Clears the slide layout background.
 * @returns {boolean} - return false if slide layout doesn't exist.
 */
ApiLayout.prototype.ClearBackground = () => true

/**
 * Sets the master background as the background of the layout.
 * @returns {boolean} - returns false if master is null or master hasn't background.
 */
ApiLayout.prototype.FollowMasterBackground = () => true

/**
 * Creates a copy of the specified slide layout object.
 * Copies without master slide.
 * @returns {ApiLayout | null} - returns new ApiLayout object that represents the copy of slide layout.
 * Returns null if slide layout doesn't exist.
 */
ApiLayout.prototype.Copy = () => new ApiLayout()

/**
 * Deletes the specified object from the parent slide master if it exists.
 * @returns {boolean} - return false if parent slide master doesn't exist.
 */
ApiLayout.prototype.Delete = () => true

/**
 * Creates a duplicate of the specified slide layout object, adds the new slide layout to the slide layout collection.
 * @param {number} [nPos = ApiMaster.GetLayoutsCount()] - Position where the new slide layout will be added.
 * @returns {ApiLayout | null} - returns new ApiLayout object that represents the copy of slide layout.
 * Returns null if slide layout doesn't exist or is not in the slide master.
 */
ApiLayout.prototype.Duplicate = (nPos) => new ApiLayout()

/**
 * Moves the specified layout to a specific location within the same collection.
 * @param {number} nPos - Position where the specified slide layout will be moved to.
 * @returns {boolean} - returns false if layout or parent slide master doesn't exist or position is invalid.
 */
ApiLayout.prototype.MoveTo = (nPos) => true

/**
 * Returns an array with all the drawing objects from the slide layout.
 * @returns {Drawing[]}
 */
ApiLayout.prototype.GetAllDrawings = () => [new Drawing()]

/**
 * Returns an array with all the shape objects from the slide layout.
 * @returns {ApiShape[]}
 */
ApiLayout.prototype.GetAllShapes = () => [new ApiShape()]

/**
 * Returns an array with all the image objects from the slide layout.
 * @returns {ApiImage[]}
 */
ApiLayout.prototype.GetAllImages = () => [new ApiImage()]

/**
 * Returns an array with all the chart objects from the slide layout.
 * @returns {ApiChart[]}
 */
ApiLayout.prototype.GetAllCharts = () => [new ApiChart()]

/**
 * Returns an array with all the OLE objects from the slide layout.
 * @returns {ApiOleObject[]}
 */
ApiLayout.prototype.GetAllOleObjects = () => [new ApiOleObject()]

/**
 * Returns an array with all tables from the current slide layout.
 *
 * @returns {ApiTable[]}
 */
ApiLayout.prototype.GetAllTables = () => [new ApiTable()]

/**
 * Returns the parent slide master of the current layout.
 * @returns {ApiMaster} - returns null if parent slide master doesn't exist.
 */
ApiLayout.prototype.GetMaster = () => new ApiMaster()

/**
 * Converts the ApiLayout object into the JSON object.
 * @memberof ApiLayout
 * @param {boolean} [bWriteMaster=false] - Specifies if the slide master will be written to the JSON object or not.
 * @param {boolean} [bWriteTableStyles=false] - Specifies whether to write used table styles to the JSON object (true) or not (false).
 * @returns {JSON}
 */
ApiLayout.prototype.ToJSON = (bWriteMaster, bWriteTableStyles) => new JSON()

/**
 * Returns an array of drawings by the specified placeholder type.
 * @memberof ApiLayout
 * @param {PlaceholderType} sType - The placeholder type.
 * @returns {Drawing[]}
 * @since 8.2.0
 */
ApiLayout.prototype.GetDrawingsByPlaceholderType = (sType) => [new Drawing()]

/**
 * Groups an array of drawings in the current layout.
 * @memberof ApiLayout
 * @param {DrawingForGroup[]} aDrawings - An array of drawings to group.
 * @returns {ApiGroup}
 * @since 8.3.0
 */
ApiLayout.prototype.GroupDrawings = (aDrawings) => new ApiGroup()

/**
 * Returns the type of the ApiPlaceholder class.
 * @returns {"placeholder"}
 */
ApiPlaceholder.prototype.GetClassType = () => ""

/**
 * Sets the placeholder type.
 * @param {PlaceholderType} sType - Placeholder type
 * @returns {boolean} - returns false if placeholder type doesn't exist.
 */
ApiPlaceholder.prototype.SetType = (sType) => true

/**
 * Returns the placeholder type.
 * @returns {PlaceholderType} - Returns the placeholder type.
 * @since 8.2.0
 */
ApiPlaceholder.prototype.GetType = () => new PlaceholderType()

/**
 * Returns the placeholder type.
 * @returns {PlaceholderType} - Returns the placeholder type.
 * @since 8.2.0
 */
ApiPlaceholder.prototype.Type = ApiPlaceholder.prototype.GetType()

/**
 * Sets the placeholder index.
 * @param {number} nIdx - The placeholder index.
 * @returns {boolean} - Returns false if the placeholder index wasn't set.
 * @since 8.2.0
 */
ApiPlaceholder.prototype.SetIndex = (nIdx) => true

/**
 * Retuns the placeholder index.
 * @returns {number | undefined} - Returns the placeholder index.
 * @since 8.2.0
 */
ApiPlaceholder.prototype.GetIndex = () => 0

/**
 * Retuns the placeholder index.
 * @returns {number | undefined} - Returns the placeholder index.
 * @since 8.2.0
 */
ApiPlaceholder.prototype.Index = ApiPlaceholder.prototype.GetIndex()

/**
 * Returns the type of the ApiTheme class.
 * @returns {"theme"}
 */
ApiTheme.prototype.GetClassType = () => ""

/**
 * Returns the slide master of the current theme.
 * @returns {ApiMaster | null} - returns null if slide master doesn't exist.
 */
ApiTheme.prototype.GetMaster = () => new ApiMaster()

/**
 * Sets the color scheme to the current presentation theme.
 * @param {ApiThemeColorScheme} oApiColorScheme - Theme color scheme.
 * @returns {boolean} - return false if color scheme doesn't exist.
 */
ApiTheme.prototype.SetColorScheme = (oApiColorScheme) => true

/**
 * Returns the color scheme of the current theme.
 * @returns {ApiThemeColorScheme}
 */
ApiTheme.prototype.GetColorScheme = () => new ApiThemeColorScheme()

/**
 * Sets the format scheme to the current presentation theme.
 * @param {ApiThemeFormatScheme} oApiFormatScheme - Theme format scheme.
 * @returns {boolean} - return false if format scheme doesn't exist.
 */
ApiTheme.prototype.SetFormatScheme = (oApiFormatScheme) => true

/**
 * Returns the format scheme of the current theme.
 * @returns {ApiThemeFormatScheme}
 */
ApiTheme.prototype.GetFormatScheme = () => new ApiThemeFormatScheme()

/**
 * Sets the font scheme to the current presentation theme.
 * @param {ApiThemeFontScheme} oApiFontScheme - Theme font scheme.
 * @returns {boolean} - return false if font scheme doesn't exist.
 */
ApiTheme.prototype.SetFontScheme = (oApiFontScheme) => true

/**
 * Returns the font scheme of the current theme.
 * @returns {ApiThemeFontScheme}
 */
ApiTheme.prototype.GetFontScheme = () => new ApiThemeFontScheme()

/**
 * Returns the type of the ApiThemeColorScheme class.
 * @returns {"themeColorScheme"}
 */
ApiThemeColorScheme.prototype.GetClassType = () => ""

/**
 * Sets a name to the current theme color scheme.
 * @param {string} sName - Theme color scheme name.
 * @returns {boolean}
 */
ApiThemeColorScheme.prototype.SetSchemeName = (sName) => true

/**
 * Changes a color in the theme color scheme.
 * @param {number} nPos - Color position in the color scheme which will be changed.
 * @param {ApiUniColor | ApiRGBColor} oColor - New color of the theme color scheme.
 * @returns {boolean}
 */
ApiThemeColorScheme.prototype.ChangeColor = (nPos, oColor) => true

/**
 * Creates a copy of the current theme color scheme.
 * @returns {ApiThemeColorScheme}
 */
ApiThemeColorScheme.prototype.Copy = () => new ApiThemeColorScheme()

/**
 * Converts the ApiThemeColorScheme object into the JSON object.
 * @memberof ApiThemeColorScheme
 * @returns {JSON}
 */
ApiThemeColorScheme.prototype.ToJSON = () => new JSON()

/**
 * Returns the type of the ApiThemeFormatScheme class.
 * @returns {"themeFormatScheme"}
 */
ApiThemeFormatScheme.prototype.GetClassType = () => ""

/**
 * Sets a name to the current theme format scheme.
 * @param {string} sName - Theme format scheme name.
 * @returns {boolean}
 */
ApiThemeFormatScheme.prototype.SetSchemeName = (sName) => true

/**
 * Sets the fill styles to the current theme format scheme.
 * @param {ApiFill[]} arrFill - The array of fill styles must contain 3 elements - subtle, moderate and intense fills.
 * If an array is empty or NoFill elements are in the array, it will be filled with the Api.CreateNoFill() elements.
 */
ApiThemeFormatScheme.prototype.ChangeFillStyles = (arrFill) => {}

/**
 * Sets the background fill styles to the current theme format scheme.
 * @param {ApiFill[]} arrBgFill - The array of background fill styles must contain 3 elements - subtle, moderate and intense fills.
 * If an array is empty or NoFill elements are in the array, it will be filled with the Api.CreateNoFill() elements.
 */
ApiThemeFormatScheme.prototype.ChangeBgFillStyles = (arrBgFill) => {}

/**
 * Sets the line styles to the current theme format scheme.
 * @param {ApiStroke[]} arrLine - The array of line styles must contain 3 elements - subtle, moderate and intense fills.
 * If an array is empty or ApiStroke elements are with no fill, it will be filled with the Api.CreateStroke(0, Api.CreateNoFill()) elements.
 */
ApiThemeFormatScheme.prototype.ChangeLineStyles = (arrLine) => {}

/**
//  * **Need to do**
//  * Sets the effect styles to the current theme format scheme.
//  * @param {?Array} arrEffect - The array of effect styles must contain 3 elements - subtle, moderate and intense fills.
//  * If an array is empty or NoFill elements are in the array, it will be filled with the Api.CreateStroke(0, Api.CreateNoFill()) elements.
//  * @returns {boolean}
//  */
// ApiThemeFormatScheme.prototype.ChangeEffectStyles = function(arrEffect){ return true; };

/**
 * Creates a copy of the current theme format scheme.
 * @returns {ApiThemeFormatScheme}
 */
ApiThemeFormatScheme.prototype.Copy = () => new ApiThemeFormatScheme()

/**
 * Converts the ApiThemeFormatScheme object into the JSON object.
 * @memberof ApiThemeFormatScheme
 * @returns {JSON}
 */
ApiThemeFormatScheme.prototype.ToJSON = () => new JSON()

/**
 * Returns the type of the ApiThemeFontScheme class.
 * @returns {"themeFontScheme"}
 */
ApiThemeFontScheme.prototype.GetClassType = () => ""

/**
 * Sets a name to the current theme font scheme.
 * @param {string} sName - Theme font scheme name.
 * @returns {boolean} - returns false if font scheme doesn't exist.
 */
ApiThemeFontScheme.prototype.SetSchemeName = (sName) => true

/**
 * Sets the fonts to the current theme font scheme.
 * @memberof ApiThemeFontScheme
 * @param {string} mjLatin - The major theme font applied to the latin text.
 * @param {string} mjEa - The major theme font applied to the east asian text.
 * @param {string} mjCs - The major theme font applied to the complex script text.
 * @param {string} mnLatin - The minor theme font applied to the latin text.
 * @param {string} mnEa - The minor theme font applied to the east asian text.
 * @param {string} mnCs - The minor theme font applied to the complex script text.
 */
ApiThemeFontScheme.prototype.SetFonts = (mjLatin, mjEa, mjCs, mnLatin, mnEa, mnCs) => {}

/**
 * Creates a copy of the current theme font scheme.
 * @returns {ApiThemeFontScheme}
 */
ApiThemeFontScheme.prototype.Copy = () => new ApiThemeFontScheme()

/**
 * Converts the ApiThemeFontScheme object into the JSON object.
 * @memberof ApiThemeFontScheme
 * @returns {JSON}
 */
ApiThemeFontScheme.prototype.ToJSON = () => new JSON()

/**
 * Returns the type of the ApiSlide class.
 * @returns {"slide"}
 */
ApiSlide.prototype.GetClassType = () => ""

/**
 * Removes all the objects from the current slide.
 * @memberof ApiSlide
 */
ApiSlide.prototype.RemoveAllObjects = () => {}

/**
 * Adds an object (image, shape or chart) to the current presentation slide.
 * @memberof ApiSlide
 * @param {ApiDrawing} oDrawing - The object which will be added to the current presentation slide.
 * @returns {boolean} - returns false if slide doesn't exist.
 */
ApiSlide.prototype.AddObject = (oDrawing) => true

/**
 * Adds a comment to the current slide.
 *
 * @memberof ApiSlide
 * @param {number} posX - The X position (in EMU) of the comment (defaults to 0).
 * @param {number} posY - The Y position (in EMU) of the comment (defaults to 0).
 * @param {string} text - The comment text.
 * @param {string} [author] - The author's name (defaults to the current user name).
 * @param {string} [userId] - The user ID of the comment author (defaults to the current user ID).
 * @returns {boolean}
 */
ApiSlide.prototype.AddComment = (posX, posY, text, author, userId) => true

/**
 * Removes objects (image, shape or chart) from the current slide.
 * @memberof ApiSlide
 * @param {number} nPos - Position from which the object will be deleted.
 * @param {number} [nCount = 1] - The number of elements to delete.
 * @returns {boolean} - returns false if slide doesn't exist or position is invalid or slide hasn't objects.
 */
ApiSlide.prototype.RemoveObject = (nPos, nCount) => true

/**
 * Sets the background to the current presentation slide.
 * @memberOf ApiSlide
 * @param {ApiFill} oApiFill - The color or pattern used to fill the presentation slide background.
 * @returns {boolean}
 */
ApiSlide.prototype.SetBackground = (oApiFill) => true

/**
 * Returns the visibility of the current presentation slide.
 * @memberOf ApiSlide
 * @returns {boolean}
 */
ApiSlide.prototype.GetVisible = () => true

/**
 * Sets the visibility to the current presentation slide.
 * @memberOf ApiSlide
 * @param {boolean} value - Slide visibility.
 * @returns {boolean}
 */
ApiSlide.prototype.SetVisible = (value) => true

/**
 * Returns the slide width in English measure units.
 * @returns {EMU}
 */
ApiSlide.prototype.GetWidth = () => new EMU()

/**
 * Returns the slide height in English measure units.
 * @returns {EMU}
 */
ApiSlide.prototype.GetHeight = () => new EMU()

/**
 * Applies the specified layout to the current slide.
 * The layout must be in slide master.
 * @param {ApiLayout} oLayout - Layout to be applied.
 * @returns {boolean} - returns false if slide doesn't exist.
 */
ApiSlide.prototype.ApplyLayout = (oLayout) => true

/**
 * Deletes the current slide from the presentation.
 * @returns {boolean} - returns false if slide doesn't exist or is not in the presentation.
 */
ApiSlide.prototype.Delete = () => true

/**
 * Creates a copy of the current slide object.
 * @returns {ApiSlide | null} - returns new ApiSlide object that represents the duplicate slide.
 * Returns null if slide doesn't exist.
 */
ApiSlide.prototype.Copy = () => new ApiSlide()

/**
 * Creates a duplicate of the specified slide object, adds the new slide to the slides collection.
 * @param {number} [nPos    = ApiPresentation.GetSlidesCount()] - Position where the new slide will be added.
 * @returns {ApiSlide | null} - returns new ApiSlide object that represents the duplicate slide.
 * Returns null if slide doesn't exist or is not in the presentation.
 */
ApiSlide.prototype.Duplicate = (nPos) => new ApiSlide()

/**
 * Moves the current slide to a specific location within the same collection.
 * @param {number} nPos - Position where the current slide will be moved to.
 * @returns {boolean} - returns false if slide doesn't exist or position is invalid or slide is not in the presentation.
 */
ApiSlide.prototype.MoveTo = (nPos) => true

/**
 * Returns a position of the current slide in the presentation.
 * @returns {number} - returns -1 if slide doesn't exist or is not in the presentation.
 */
ApiSlide.prototype.GetSlideIndex = () => 0

/**
 * Clears the slide background.
 * @returns {boolean} - return false if slide doesn't exist.
 */
ApiSlide.prototype.ClearBackground = () => true

/**
 * Sets the layout background as the background of the slide.
 * @returns {boolean} - returns false if layout is null or layout hasn't background or slide doesn't exist.
 */
ApiSlide.prototype.FollowLayoutBackground = () => true

/**
 * Sets the master background as the background of the slide.
 * @returns {boolean} - returns false if master is null or master hasn't background or slide doesn't exist.
 */
ApiSlide.prototype.FollowMasterBackground = () => true

/**
 * Applies the specified theme to the current slide.
 * @param {ApiTheme} oApiTheme - Presentation theme.
 * @returns {boolean} - returns false if master is null or master hasn't background.
 */
ApiSlide.prototype.ApplyTheme = (oApiTheme) => true

/**
 * Returns a layout of the current slide.
 * @returns {ApiLayout | null} - returns null if slide or layout doesn't exist.
 */
ApiSlide.prototype.GetLayout = () => new ApiLayout()

/**
 * Returns a theme of the current slide.
 * @returns {ApiTheme} - returns null if slide or layout or master or theme doesn't exist.
 */
ApiSlide.prototype.GetTheme = () => new ApiTheme()

/**
 * Returns an array with all the drawing objects from the slide.
 * @returns {Drawing[]}
 */
ApiSlide.prototype.GetAllDrawings = () => [new Drawing()]

/**
 * Returns an array with all the shape objects from the slide.
 * @returns {ApiShape[]}
 */
ApiSlide.prototype.GetAllShapes = () => [new ApiShape()]

/**
 * Returns an array with all the image objects from the slide.
 * @returns {ApiImage[]}
 */
ApiSlide.prototype.GetAllImages = () => [new ApiImage()]

/**
 * Returns an array with all the chart objects from the slide.
 * @returns {ApiChart[]}
 */
ApiSlide.prototype.GetAllCharts = () => [new ApiChart()]

/**
 * Returns an array with all the OLE objects from the slide.
 * @returns {ApiOleObject[]}
 */
ApiSlide.prototype.GetAllOleObjects = () => [new ApiOleObject()]

/**
 * Returns an array with all tables from the current slide.
 *
 * @returns {ApiTable[]}
 */
ApiSlide.prototype.GetAllTables = () => [new ApiTable()]

/**
 * Converts the ApiSlide object into the JSON object.
 * @memberof ApiSlide
 * @param {boolean} [bWriteLayout=false] - Specifies if the slide layout will be written to the JSON object or not.
 * @param {boolean} [bWriteMaster=false] - Specifies if the slide master will be written to the JSON object or not (bWriteMaster is false if bWriteLayout === false).
 * @param {boolean} [bWriteAllMasLayouts=false] - Specifies if all child layouts from the slide master will be written to the JSON object or not.
 * @param {boolean} [bWriteTableStyles=false] - Specifies whether to write used table styles to the JSON object (true) or not (false).
 * @returns {JSON}
 */
ApiSlide.prototype.ToJSON = (bWriteLayout, bWriteMaster, bWriteAllMasLayouts, bWriteTableStyles) =>
  new JSON()

/**
 * Returns an array of drawings by the specified placeholder type.
 * @memberof ApiSlide
 * @param {PlaceholderType} sType - The placeholder type.
 * @returns {Drawing[]}
 * @since 8.2.0
 */
ApiSlide.prototype.GetDrawingsByPlaceholderType = (sType) => [new Drawing()]

/**
 * Selects the current slide.
 * @memberof ApiSlide
 * @since 8.3.0
 */
ApiSlide.prototype.Select = () => {}

/**
 * Groups an array of drawings in the current slide.
 * @memberof ApiSlide
 * @param {DrawingForGroup[]} aDrawings - An array of drawings to group.
 * @returns {ApiGroup}
 * @since 8.3.0
 */
ApiSlide.prototype.GroupDrawings = (aDrawings) => new ApiGroup()

/**
 * Returns the notes page from the current slide.
 * @memberof ApiSlide
 * @returns {ApiNotesPage | null}
 * @since 9.0.0
 */
ApiSlide.prototype.GetNotesPage = () => new ApiNotesPage()

/**
 * Adds a text to the notes page of the current slide.
 * @memberof ApiSlide
 * @param {string} sText - The text to be added to the notes page.
 * @returns {boolean} - Returns true if text was added successfully, otherwise false.
 * @since 9.0.0
 */
ApiSlide.prototype.AddNotesText = (sText) => true

/**
 * Returns the type of the ApiNotesPage class.
 *
 * @returns {"notesPage"}
 * @since 9.0.0
 */
ApiNotesPage.prototype.GetClassType = () => ""

/**
 * Returns a shape with the type="body" attribute from the current notes page.
 * @memberof ApiNotesPage
 * @returns {ApiShape | null}
 * @since 9.0.0
 */
ApiNotesPage.prototype.GetBodyShape = () => new ApiShape()

/**
 * Adds a text to the body shape of the current notes page.
 * @memberof ApiNotesPage
 * @param {string} sText - The text to be added to the body shape.
 * @returns {boolean} - Returns true if text was added successfully, otherwise false.
 * @since 9.0.0
 */
ApiNotesPage.prototype.AddBodyShapeText = (sText) => true

/**
 * Gets the text from the body shape of the current notes page.
 *
 * @memberof ApiNotesPage
 * @returns {string}
 * @since 9.1.0
 */
ApiNotesPage.prototype.GetBodyShapeText = (sText) => ""

/**
 * Returns the type of the ApiDrawing class.
 * @returns {"drawing"}
 */
ApiDrawing.prototype.GetClassType = () => ""

/**
 * Sets the size of the object (image, shape, chart) bounding box.
 * @param {EMU} nWidth - The object width measured in English measure units.
 * @param {EMU} nHeight - The object height measured in English measure units.
 */
ApiDrawing.prototype.SetSize = (nWidth, nHeight) => {}

/**
 * Sets the position of the drawing on the slide.
 * @param {EMU} nPosX - The distance from the left side of the slide to the left side of the drawing measured in English measure units.
 * @param {EMU} nPosY - The distance from the top side of the slide to the upper side of the drawing measured in English measure units.
 */
ApiDrawing.prototype.SetPosition = (nPosX, nPosY) => {}

/**
 * Returns the drawing parent object.
 * @returns {ApiSlide | ApiLayout | ApiMaster | null}
 */
ApiDrawing.prototype.GetParent = () => new ApiSlide()

/**
 * Returns the drawing parent slide.
 * @returns {ApiSlide | null} - return null if parent ins't a slide.
 */
ApiDrawing.prototype.GetParentSlide = () => new ApiSlide()

/**
 * Returns the drawing parent slide layout.
 * @returns {ApiLayout | null} - return null if parent ins't a slide layout.
 */
ApiDrawing.prototype.GetParentLayout = () => new ApiLayout()

/**
 * Returns the drawing parent slide master.
 * @returns {ApiMaster | null} - return null if parent ins't a slide master.
 */
ApiDrawing.prototype.GetParentMaster = () => new ApiMaster()

/**
 * Creates a copy of the specified drawing object.
 * @returns {ApiDrawing} - return null if drawing doesn't exist.
 */
ApiDrawing.prototype.Copy = () => new ApiDrawing()

/**
 * Deletes the specified drawing object from the parent.
 * @returns {boolean} - false if drawing doesn't exist or drawing hasn't a parent.
 */
ApiDrawing.prototype.Delete = () => true

/**
 * Sets the specified placeholder to the current drawing object.
 * @param {ApiPlaceholder} oPlaceholder - Placeholder object.
 * @returns {boolean} - returns false if parameter isn't a placeholder.
 */
ApiDrawing.prototype.SetPlaceholder = (oPlaceholder) => true

/**
 * Returns a placeholder from the current drawing object.
 * @returns {ApiPlaceholder | null} - returns null if placeholder doesn't exist.
 */
ApiDrawing.prototype.GetPlaceholder = () => new ApiPlaceholder()

/**
 * Returns the width of the current drawing.
 * @memberof ApiDrawing
 * @returns {EMU}
 */
ApiDrawing.prototype.GetWidth = () => new EMU()

/**
 * Returns the height of the current drawing.
 * @memberof ApiDrawing
 * @returns {EMU}
 */
ApiDrawing.prototype.GetHeight = () => new EMU()

/**
 * Returns the lock value for the specified lock type of the current drawing.
 * @param {DrawingLockType} sType - Lock type in the string format.
 * @returns {boolean}
 */
ApiDrawing.prototype.GetLockValue = (sType) => true

/**
 * Sets the lock value to the specified lock type of the current drawing.
 * @param {DrawingLockType} sType - Lock type in the string format.
 * @param {boolean} bValue - Specifies if the specified lock is applied to the current drawing.
 * @returns {boolean}
 */
ApiDrawing.prototype.SetLockValue = (sType, bValue) => true

/**
 * Converts the ApiDrawing object into the JSON object.
 * @memberof ApiDrawing
 * @returns {JSON}
 */
ApiDrawing.prototype.ToJSON = () => new JSON()

/**
 * Selects the current graphic object.
 * @memberof ApiDrawing
 * @since 8.2.0
 */
ApiDrawing.prototype.Select = () => {}

/**
 * Sets the rotation angle to the current drawing object.
 * @memberof ApiDrawing
 * @param {number} nRotAngle - New drawing rotation angle.
 * @returns {boolean}
 * @since 9.0.0
 */
ApiDrawing.prototype.SetRotation = (nRotAngle) => true

/**
 * Returns the rotation angle of the current drawing object.
 * @memberof ApiDrawing
 * @returns {number}
 * @since 9.0.0
 */
ApiDrawing.prototype.GetRotation = () => 0

/**
 * Returns a type of the ApiGroup class.
 * @memberof ApiGroup
 * @returns {"group"}
 * @since 8.3.0
 */
ApiGroup.prototype.GetClassType = () => ""

/**
 * Ungroups the current group of drawings.
 * @memberof ApiGroup
 * @returns {boolean}
 * @since 8.3.0
 */
ApiGroup.prototype.Ungroup = () => true

/**
 * Returns the type of the ApiImage class.
 * @returns {"image"}
 */
ApiImage.prototype.GetClassType = () => ""

/**
 * Returns the type of the ApiShape class.
 * @returns {"shape"}
 */
ApiShape.prototype.GetClassType = () => ""

/**
 * Deprecated in 6.2.
 * Returns the shape inner contents where a paragraph or text runs can be inserted.
 * @returns {ApiDocumentContent}
 */
ApiShape.prototype.GetDocContent = () => new ApiDocumentContent()

/**
 * Returns the shape inner contents where a paragraph or text runs can be inserted.
 * @returns {ApiDocumentContent}
 */
ApiShape.prototype.GetContent = () => new ApiDocumentContent()

/**
 * Sets the vertical alignment to the shape content where a paragraph or text runs can be inserted.
 * @param {VerticalTextAlign} VerticalAlign - The type of the vertical alignment for the shape inner contents.
 */
ApiShape.prototype.SetVerticalTextAlign = (VerticalAlign) => {}

/**
 * Gets the geometry object from a shape
 * @memberof ApiShape
 * @returns {ApiGeometry}
 * @since 9.1.0
 */
ApiShape.prototype.GetGeometry = () => new ApiGeometry()

/**
 * Sets a custom geometry for the shape
 * @memberof ApiShape
 * @param {ApiGeometry} oGeometry - The geometry to set
 * @returns {boolean}
 * @since 9.1.0
 */
ApiShape.prototype.SetGeometry = (oGeometry) => true

/**
 * Returns a type of the ApiOleObject class.
 * @memberof ApiOleObject
 * @returns {"oleObject"}
 */
ApiOleObject.prototype.GetClassType = () => ""

/**
 * Sets the data to the current OLE object.
 * @memberof ApiOleObject
 * @param {string} sData - The OLE object string data.
 * @returns {boolean}
 */
ApiOleObject.prototype.SetData = (sData) => true

/**
 * Returns the string data from the current OLE object.
 * @memberof ApiOleObject
 * @returns {string}
 */
ApiOleObject.prototype.GetData = () => ""

/**
 * Sets the application ID to the current OLE object.
 * @memberof ApiOleObject
 * @param {string} sAppId - The application ID associated with the current OLE object.
 * @returns {boolean}
 */
ApiOleObject.prototype.SetApplicationId = (sAppId) => true

/**
 * Returns the application ID from the current OLE object.
 * @memberof ApiOleObject
 * @returns {string}
 */
ApiOleObject.prototype.GetApplicationId = () => ""

/**
 * Returns the type of the ApiTable object.
 * @returns {"table"}
 */
ApiTable.prototype.GetClassType = () => ""

/**
 * Returns a row by its index.
 * @param nIndex {number} - The row index (position) in the table.
 * @returns {ApiTableRow}
 */
ApiTable.prototype.GetRow = (nIndex) => new ApiTableRow()

/**
 * Merges an array of cells. If merge is successful, it will return merged cell, otherwise "null".
 * <b>Warning</b>: The number of cells in any row and the number of rows in the current table may be changed.
 * @param {ApiTableCell[]} aCells - The array of cells.
 * @returns {ApiTableCell}
 */
ApiTable.prototype.MergeCells = (aCells) => new ApiTableCell()

/**
 * Specifies the components of the conditional formatting of the referenced table style (if one exists)
 * which shall be applied to the set of table rows with the current table-level property exceptions. A table style
 * can specify up to six different optional conditional formats [Example: Different formatting for first column],
 * which then can be applied or omitted from individual table rows in the parent table.
 *
 * The default setting is to apply the row and column banding formatting, but not the first row, last row, first
 * column, or last column formatting.
 * @param {boolean} isFirstColumn - Specifies that the first column conditional formatting shall be applied to the
 *     table.
 * @param {boolean} isFirstRow - Specifies that the first row conditional formatting shall be applied to the table.
 * @param {boolean} isLastColumn - Specifies that the last column conditional formatting shall be applied to the
 *     table.
 * @param {boolean} isLastRow - Specifies that the last row conditional formatting shall be applied to the table.
 * @param {boolean} isHorBand - Specifies that the horizontal banding conditional formatting shall not be applied
 *     to the table.
 * @param {boolean} isVerBand - Specifies that the vertical banding conditional formatting shall not be applied to
 *     the table.
 */
ApiTable.prototype.SetTableLook = (
  isFirstColumn,
  isFirstRow,
  isLastColumn,
  isLastRow,
  isHorBand,
  isVerBand,
) => {}

/**
 * Adds a new row to the current table.
 * @param {ApiTableCell} [oCell] - If not specified, a new row will be added to the end of the table.
 * @param {boolean} [isBefore=false] - Adds a new row before or after the specified cell. If no cell is specified,
 * then this parameter will be ignored.
 * @returns {ApiTableRow}
 */
ApiTable.prototype.AddRow = (oCell, isBefore) => new ApiTableRow()

/**
 * Adds a new column to the end of the current table.
 * @param {ApiTableCell} [oCell] - If not specified, a new column will be added to the end of the table.
 * @param {boolean} [isBefore=false] - Add a new column before or after the specified cell. If no cell is specified,
 * then this parameter will be ignored.
 */
ApiTable.prototype.AddColumn = (oCell, isBefore) => {}

/**
 * Removes a table row with the specified cell.
 * @param {ApiTableCell} oCell - The table cell from the row which will be removed.
 * @returns {boolean} - defines if the table is empty after removing or not.
 */
ApiTable.prototype.RemoveRow = (oCell) => true

/**
 * Removes a table column with the specified cell.
 * @param {ApiTableCell} oCell - The table cell from the column which will be removed.
 * @returns {boolean} - defines if the table is empty after removing or not.
 */
ApiTable.prototype.RemoveColumn = (oCell) => true

/**
 * Specifies the shading which shall be applied to the extents of the current table.
 * @param {ShdType | ApiFill} sType - The shading type applied to the contents of the current table. Can be ShdType or ApiFill.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 */
ApiTable.prototype.SetShd = (sType, r, g, b) => {}

/**
 * Converts the ApiTable object into the JSON object.
 * @memberof ApiTable
 * @param {boolean} [bWriteTableStyles=false] - Specifies whether to write used table styles to the JSON object (true) or not (false).
 * @returns {JSON}
 */
ApiTable.prototype.ToJSON = (bWriteTableStyles) => new JSON()

/**
 * Returns the type of the ApiTableRow class.
 * @returns {"tableRow"}
 */
ApiTableRow.prototype.GetClassType = () => ""

/**
 * Returns a number of cells in the current row.
 * @returns {number}
 */
ApiTableRow.prototype.GetCellsCount = () => 0

/**
 * Returns a cell by its position in the current row.
 * @param {number} nPos - The cell position in the table row.
 * @returns {ApiTableCell}
 */
ApiTableRow.prototype.GetCell = (nPos) => new ApiTableCell()

/**
 * Sets the height to the current table row.
 * @param {EMU} [nValue] - The row height in English measure units.
 */
ApiTableRow.prototype.SetHeight = (nValue) => {}

/**
 * Returns the type of the ApiTableCell class.
 * @returns {"tableCell"}
 */
ApiTableCell.prototype.GetClassType = () => ""

/**
 * Returns the current cell content.
 * @returns {ApiDocumentContent}
 */
ApiTableCell.prototype.GetContent = () => new ApiDocumentContent()

/**
 * Specifies the shading which shall be applied to the extents of the current table cell.
 * @param {ShdType | ApiFill} sType - The shading type applied to the contents of the current table. Can be ShdType or ApiFill.
 * @param {byte} r - Red color component value.
 * @param {byte} g - Green color component value.
 * @param {byte} b - Blue color component value.
 */
ApiTableCell.prototype.SetShd = (sType, r, g, b) => {}

/**
 * Specifies an amount of space which shall be left between the bottom extent of the cell contents and the border
 * of a specific individual table cell within a table.
 * @param {?twips} nValue - If this value is <code>null</code>, then default table cell bottom margin shall be used,
 * otherwise override the table cell bottom margin with specified value for the current cell.
 */
ApiTableCell.prototype.SetCellMarginBottom = (nValue) => {}

/**
 * Specifies an amount of space which shall be left between the left extent of the current cell contents and the
 * left edge border of a specific individual table cell within a table.
 * @param {?twips} nValue - If this value is <code>null</code>, then default table cell left margin shall be used,
 * otherwise override the table cell left margin with specified value for the current cell.
 */
ApiTableCell.prototype.SetCellMarginLeft = (nValue) => {}

/**
 * Specifies an amount of space which shall be left between the right extent of the current cell contents and the
 * right edge border of a specific individual table cell within a table.
 * @param {?twips} nValue - If this value is <code>null</code>, then default table cell right margin shall be used,
 * otherwise override the table cell right margin with specified value for the current cell.
 */
ApiTableCell.prototype.SetCellMarginRight = (nValue) => {}

/**
 * Specifies an amount of space which shall be left between the top extent of the current cell contents and the
 * top edge border of a specific individual table cell within a table.
 * @param {?twips} nValue - If this value is <code>null</code>, then default table cell top margin shall be used,
 * otherwise override the table cell top margin with specified value for the current cell.
 */
ApiTableCell.prototype.SetCellMarginTop = (nValue) => {}

/**
 * Sets the border which shall be displayed at the bottom of the current table cell.
 * @param {mm} fSize - The width of the current border.
 * @param {ApiFill} oApiFill - The color or pattern used to fill the current border.
 */
ApiTableCell.prototype.SetCellBorderBottom = (fSize, oApiFill) => {}

/**
 * Sets the border which shall be displayed at the left of the current table cell.
 * @param {mm} fSize - The width of the current border.
 * @param {ApiFill} oApiFill - The color or pattern used to fill the current border.
 */
ApiTableCell.prototype.SetCellBorderLeft = (fSize, oApiFill) => {}

/**
 * Sets the border which shall be displayed at the right of the current table cell.
 * @param {mm} fSize - The width of the current border.
 * @param {ApiFill} oApiFill - The color or pattern used to fill the current border.
 */
ApiTableCell.prototype.SetCellBorderRight = (fSize, oApiFill) => {}

/**
 * Sets the border which shall be displayed at the top of the current table cell.
 * @param {mm} fSize - The width of the current border.
 * @param {ApiFill} oApiFill - The color or pattern used to fill the current border.
 */
ApiTableCell.prototype.SetCellBorderTop = (fSize, oApiFill) => {}

/**
 * Specifies the vertical alignment for text within the current table cell.
 * @param {("top" | "center" | "bottom")} sType - The type of the vertical alignment.
 */
ApiTableCell.prototype.SetVerticalAlign = (sType) => {}

/**
 * Specifies the direction of the text flow for the current table cell.
 * @param {("lrtb" | "tbrl" | "btlr")} sType - The type of the text flow direction.
 */
ApiTableCell.prototype.SetTextDirection = (sType) => {}

/**
 * Class representing the selection in the presentation.
 * @constructor
 */
function ApiSelection() {}

/**
 * Returns the type of the current selection.
 * @memberof ApiSelection
 * @returns {SelectionType}
 * @since 8.3.0
 */
ApiSelection.prototype.GetType = () => new SelectionType()

/**
 * Returns the selected shapes.
 * @memberof ApiSelection
 * @returns {ApiDrawing[]}
 * @since 8.3.0
 */
ApiSelection.prototype.GetShapes = () => [new ApiDrawing()]

/**
 * Returns the selected slides.
 * @memberof ApiSelection
 * @returns {ApiSlide[]}
 * @since 8.3.0
 */
ApiSelection.prototype.GetSlides = () => [new ApiSlide()]
