const fs = require('fs');
const path = require('path')

const args = process.argv.slice(2);
const name = args[0];
const types = args.slice(1);
const pathDir = path.dirname(args[1]);
const pathComponents = 'src/components'

// console.log(name, types, path.resolve(pathDir, pathComponents, name))
init(name, types)

function fileHandler(name, type){
  const pathLocal = `${'index'}.${type}`

  try {
    fs.openSync( path.resolve(pathDir, pathComponents, name, pathLocal),'w')
    console.log(`File ${pathLocal} created`);
  } catch (error) {
    console.error(error)
  }
}

function dirHandler(name) {

  if (!checkDir(name)) return false;

  try {
    fs.mkdirSync(path.resolve(pathDir, pathComponents, name))
    console.log(`Directiory ${name} created`);
    return true;
  } catch (error) {
    console.error(error)
  }

}

function checkDir(name) {
  try {
    fs.statSync(path.resolve(pathDir, pathComponents, name));
    console.log('DIRECTORY EXISTS');
    return false;
  }
  catch (err) {
    if (err.code === 'ENOENT') {
      console.log('DIRECTORY DOES NOT EXIST');
      return true;
    }
  }
}

function init(name, arrType) {

  if (!dirHandler(name)) return;

  arrType.forEach(element => {
    if (element === 'pug') {
      fileHandler(name, 'pug')
    }
    if (element === 'sass') {
      fileHandler(name, 'sass')
    }
    if (element === 'js') {
      fileHandler(name, 'js')
    }
  });

}
