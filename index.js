require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
var AdmZip = require("adm-zip");

const { parseForm, uploadToS3, getLaunchPath } = require('./helper')

const PORT = process.env.PORT;

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/upload-course', async (req, res, next) => {
  const { files } = await parseForm(req);
  if(!files) throw new Error("File not found");

  const fileName = files.file.originalFilename.slice(0, files.file.originalFilename.lastIndexOf("."));
  const zip = new AdmZip(files.file.filepath);
  let resData = {}

  try{
    const zipEntries = zip.getEntries();
    for await (zipEntry of zipEntries){
      const result = await uploadToS3((fileName + "/" + zipEntry.entryName), zipEntry.getData());
      if (zipEntry.entryName == "imsmanifest.xml") {
        const launchPath = await getLaunchPath(zipEntry);
        resData.Bucket = result.Bucket;
        resData.Key = (fileName + "/" + launchPath);
      }
    }
    res.send({status : 200, data : resData})
  }catch(err){
    console.log(err)
    res.send(err)
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});