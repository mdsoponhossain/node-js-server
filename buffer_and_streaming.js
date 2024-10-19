const fs = require('fs');
fs.readFile(__dirname + '/welcome.txt','utf8', (err, data) => {
    if (err) {
        console.log(err)
    }
    else {
        console.log(data)
        // writing file:
        fs.writeFile('./welcome.pdf',data,'utf8',(err)=>{
            if(err){
                console.log(err)
            }else{
                console.log('writing file successful')
            }
        })
    }
})