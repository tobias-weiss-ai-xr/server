import * as Editor from './editor';

const EditorUIController = () => null;

EditorUIController.isSupportEditFeature = () => true;
<<<<<<< HEAD
=======
EditorUIController.getToolbarOptions = Editor.getToolbarOptions;
EditorUIController.getUndoRedo = Editor.getUndoRedo;
EditorUIController.initThemeColors = Editor.initThemeColors;
EditorUIController.initFonts = Editor.initFonts;
EditorUIController.initEditorStyles = Editor.initEditorStyles;
EditorUIController.initFocusObjects = Editor.initFocusObjects;
EditorUIController.initTableTemplates = Editor.initTableTemplates;
EditorUIController.updateChartStyles = Editor.updateChartStyles;
EditorUIController.getEditCommentControllers = Editor.getEditCommentControllers;
// EditorUIController.ContextMenu = Editor.ContextMenu; // Disabled for EE parity
>>>>>>> f25c31868f55f050aa3b91e2a4918d210abeed80

export default EditorUIController;
