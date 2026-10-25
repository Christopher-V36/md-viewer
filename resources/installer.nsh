; ---------------------------------------------------------------------------
; MD Viewer - registro adicional de asociaciones de archivo
;
; electron-builder solo escribe el ProgId de cada extension y lo deja como
; predeterminado. Esto ademas:
;   - agrega el ProgId a la lista "Abrir con" de cada extension
;   - registra la app en Software\Classes\Applications
; para que MD Viewer se pueda elegir como predeterminado desde Windows aunque
; otra app se haya quedado con el UserChoice de esa extension.
; ---------------------------------------------------------------------------

!macro regOpenWith EXT PROGID
  WriteRegStr SHELL_CONTEXT "Software\Classes\.${EXT}\OpenWithProgids" "${PROGID}" ""
  WriteRegStr SHELL_CONTEXT "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}\SupportedTypes" ".${EXT}" ""
  ; electron-builder escribe este comando sin comillas; con espacios en la ruta Windows lo descarta del selector "Abrir con".
  WriteRegStr SHELL_CONTEXT "Software\Classes\${PROGID}\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
!macroend

!macro unregOpenWith EXT PROGID
  DeleteRegValue SHELL_CONTEXT "Software\Classes\.${EXT}\OpenWithProgids" "${PROGID}"
!macroend

!macro customInstall
  WriteRegStr SHELL_CONTEXT "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}" "FriendlyAppName" "MD Viewer"
  WriteRegStr SHELL_CONTEXT "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
  WriteRegStr SHELL_CONTEXT "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"

  !insertmacro regOpenWith "md"       "MDViewer.md"
  !insertmacro regOpenWith "markdown" "MDViewer.markdown"
  !insertmacro regOpenWith "pdf"      "MDViewer.pdf"
  !insertmacro regOpenWith "docx"     "MDViewer.docx"
  !insertmacro regOpenWith "xlsx"     "MDViewer.xlsx"
  !insertmacro regOpenWith "pptx"     "MDViewer.pptx"
  !insertmacro regOpenWith "html"     "MDViewer.html"
  !insertmacro regOpenWith "htm"      "MDViewer.htm"
  !insertmacro regOpenWith "csv"      "MDViewer.csv"
  !insertmacro regOpenWith "json"     "MDViewer.json"
  !insertmacro regOpenWith "xml"      "MDViewer.xml"

  System::Call "shell32::SHChangeNotify(i,i,i,i) (0x08000000, 0x1000, 0, 0)"
!macroend

!macro customUnInstall
  !insertmacro unregOpenWith "md"       "MDViewer.md"
  !insertmacro unregOpenWith "markdown" "MDViewer.markdown"
  !insertmacro unregOpenWith "pdf"      "MDViewer.pdf"
  !insertmacro unregOpenWith "docx"     "MDViewer.docx"
  !insertmacro unregOpenWith "xlsx"     "MDViewer.xlsx"
  !insertmacro unregOpenWith "pptx"     "MDViewer.pptx"
  !insertmacro unregOpenWith "html"     "MDViewer.html"
  !insertmacro unregOpenWith "htm"      "MDViewer.htm"
  !insertmacro unregOpenWith "csv"      "MDViewer.csv"
  !insertmacro unregOpenWith "json"     "MDViewer.json"
  !insertmacro unregOpenWith "xml"      "MDViewer.xml"

  DeleteRegKey SHELL_CONTEXT "Software\Classes\Applications\${APP_EXECUTABLE_FILENAME}"
  System::Call "shell32::SHChangeNotify(i,i,i,i) (0x08000000, 0x1000, 0, 0)"
!macroend
