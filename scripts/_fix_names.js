const fs=require("fs")
const m={
China:"中国",USA:"美国",Russia:"俄罗斯",Japan:"日本",India:"印度",Brazil:"巴西",
UK:"英国",France:"法国",Germany:"德国",Australia:"澳大利亚",Canada:"加拿大",
"South Africa":"南非","Saudi Arabia":"沙特",Nigeria:"尼日利亚",Egypt:"埃及",
Indonesia:"印尼",Iran:"伊朗",Turkey:"土耳其",Mexico:"墨西哥",Argentina:"阿根廷","South Korea":"韩国"
}
let d=fs.readFileSync("public/countries.geojson","utf8")
for(let[k,v] of Object.entries(m)) d=d.split('\"name\":\"'+k+'\"').join('\"name\":\"'+v+'\"')
fs.writeFileSync("public/countries.geojson",d)
console.log("done "+Object.keys(m).length+" countries")
