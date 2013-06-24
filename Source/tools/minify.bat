REM build enyo
@CALL ..\enyo\minify\minify.bat %@

REM build app
@CALL ..\enyo\tools\minify.bat package.js -output ..\build\app %@
@CALL ..\enyo\tools\minify.bat package.js -output ..\..\Android\assets\www\build\app %@
pause