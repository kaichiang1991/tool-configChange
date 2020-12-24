const fs = require('fs')
const unzipper = require('unzipper')
const archiver = require('archiver')

const archive1 = archiver('zip')
const archive2 = archiver('zip')

const dirName = process.argv[2].split('.')[0]

let outputOn = fs.createWriteStream(`./output/${dirName}_on.zip`)
let outputOff = fs.createWriteStream(`./output/${dirName}_Off.zip`)

archive1.pipe(outputOn)
archive2.pipe(outputOff)

fs.createReadStream(`${dirName}.zip`)
    .pipe(unzipper.Extract({path: './tmp'}))
    .on('finish', ()=>{
        setTimeout(() => {
            createConfig()
            createZip(true)
            createZip(false)
        }, 1000);
    })

var createConfig = ()=>{
    // 不管DemoOn的值，寫出兩個版本的
    let config = fs.readFileSync(`./tmp/${dirName}/gameConfig.json`, {encoding: 'utf8'})
    config = JSON.parse(config)
    config.HistoricalRecordButtonAvailable = false
    config.DemoOn = true
    fs.writeFileSync(`./tmp/${dirName}/gameConfig.On.json`, JSON.stringify(config, null, 2))

    config.DemoOn = false
    fs.writeFileSync(`./tmp/${dirName}/gameConfig.Off.json`, JSON.stringify(config, null, 2))

    // 刪除原本的config.json
    fs.unlinkSync(`./tmp/${dirName}/gameConfig.json`)
}

var createZip = (flag) =>{
    let dir = fs.readdirSync(`./tmp/${dirName}`, {withFileTypes: true}), fileName
    let archive = flag? archive1: archive2
    dir.forEach(_dir =>{
        fileName = `./tmp/${dirName}/` + _dir.name
        if(_dir.isDirectory()){
            archive.directory(fileName, _dir.name)
        }else{
            if(/gameConfig*/.test(_dir.name)){      // 是要改的 config 檔
                if(/.Off/.test(_dir.name) != flag){
                    archive.append(fs.createReadStream(fileName), {name: 'gameConfig.json'})
                }
            }else{
                archive.append(fs.createReadStream(fileName), {name: _dir.name})
            }
        }
        
    })
    archive.finalize()
    console.log(dirName, ' create success')
}
