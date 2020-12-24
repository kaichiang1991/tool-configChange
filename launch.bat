rmdir /q/s output
mkdir output

for %%x in (bn*-master.zip) do (
   node main.js %%x
)

rmdir /q/s tmp
pause