const express=require('express')
const path=require("path")
const app=express()
app.use(express.json())
app.use('/public', express.static(path.join(__dirname, 'public')));
function printmat(arr){
    for(let i=0;i<arr.length;i++){
        console.log(arr[i]);
    }
}
function makematrix(key){
    console.log("key matrix : ")
    let arr=[]
    let k=0
    if(key.length<=4){
        for(let i=0;i<2;i++){
            arr[i]=[]
            for(let j=0;j<2;j++){
                if(k<key.length){
                    arr[i][j]=((key.charCodeAt(k))-97)%26;
                    k++;
                }
                else{
                    arr[i][j]=23;
                }
            }
        }
    }
    else{
        for(let i=0;i<3;i++){
            arr[i]=[]
            for(let j=0;j<3;j++){
                if(k<key.length){
                    arr[i][j]=((key.charCodeAt(k))-97)%26;
                    k++;
                }
                else{
                    arr[i][j]=23;
                }
            }
        }
    }
    printmat(arr);
    return arr;
}
function makeplaintext(plaintext,value){
    let arr=[]
    k=0
    if(value==2){
        if((plaintext.length)%2!=0){
            plaintext+="x"
        }
        for(let i=0;i<plaintext.length/2;i++){
            arr[i]=[]
            arr[i][0]=plaintext.charCodeAt(k)-97;
            arr[i][1]=plaintext.charCodeAt(k+1)-97;
            k+=2;
        }
    }
    else{
        if((plaintext.length)%3==1){
            plaintext+="xx";
        }
        else if((plaintext.length)%3==2){
            plaintext+="x";
        }
        for(let i=0;i<plaintext.length/3;i++){
            arr[i]=[]
            arr[i][0]=plaintext.charCodeAt(k)-97;
            arr[i][1]=plaintext.charCodeAt(k+1)-97;
            arr[i][2]=plaintext.charCodeAt(k+2)-97;
            k+=3;
        }
    }
    printmat(arr)
    return arr;
}
function encrption(key,plaintext){
    let arr;
    if(key.length<=4){
        arr=makeplaintext(plaintext,2);
    }
    else{
        arr=makeplaintext(plaintext,3);
    }
    return arr;
}
function matrixmul(keyarr,plaintextarr){
    let arr=[]
    if(plaintextarr.length<=2){
        for(let i=0;i<plaintextarr.length;i++){
            arr[i]=(keyarr[i][0]*plaintextarr[0]+keyarr[i][1]*plaintextarr[1])%26
        }
    }
    else{   
        for(let i=0;i<plaintextarr.length;i++){
            arr[i]=(keyarr[i][0]*plaintextarr[0]+keyarr[i][1]*plaintextarr[1]+keyarr[i][2]*plaintextarr[2])%26
        }
    }
    return arr;
}
function adjmatrixtwo(arr){
    console.log("adj matrix: ")
    let a=arr[0][0];
    arr[0][0]=arr[1][1];
    arr[1][1]=a;
    arr[0][1]=-1*arr[0][1]+26;
    arr[1][0]=-1*arr[1][0]+26;
    return arr;
}
function adjthree(arr){
    console.log("adj matrix: ")
    let adjarr=[]
    for(let i=0;i<arr.length;i++){
        for(let j=0;j<arr[i].length;j++){
            if (!adjarr[j]) {
                adjarr[j] = [];
            }
            let val=((arr[(i+1)%3][(j+1)%3]*arr[(i+2)%3][(j+2)%3])-(arr[(i+1)%3][(j+2)%3]*arr[(i+2)%3][(j+1)%3]));
            adjarr[j][i]=(val+520)%26;
        }
    }
    return adjarr;
}
function inversedeterminant(value){ 
    let obj={
        15:7,
        11:19,
        5:21,
        17:23,
        3:9
    }
    if(value==1 || value==25){
        return value
    }
    for (let key in obj) {
        if (obj[key] == value) {
            return parseInt(key); // Return the key if its corresponding value matches 'value'
        }
        if (parseInt(key) == value) {
            return obj[key]; // Return the value if the key matches 'value'
        }
    }
    return -1;
}
app.get("/",(req,res)=>{
    res.sendFile(__dirname+"/public/index.html")
})
app.post('/encryption',(req,res)=>{
    let key=req.body.key;
    let plaintext=req.body.plaintext;
    console.log(key)
    console.log(plaintext)
    let keyarr=makematrix(key)
    console.log("plain text arr:")
    let plaintextarr=encrption(key,plaintext);
    let answer=[];
    for(let i=0;i<plaintextarr.length;i++){
        answer[i]=matrixmul(keyarr,plaintextarr[i]);
    }
    let charanswer=[]
    let final="";
    for(let j=0;j<answer.length;j++){
        charanswer[j]=[]
        for(let i=0;i<answer[j].length;i++){
            charanswer[j][i]=String.fromCharCode(answer[j][i]+97);
            final+=String.fromCharCode(answer[j][i]+97);
        }
    }
    console.log("answer encryption: ");
    printmat(answer);
    printmat(charanswer);
    res.json({
        keyarr:keyarr,
        plaintextarr:plaintextarr,
        answer:answer,
        charanswer:charanswer,
        final:final
    })
})
app.post('/decryption',(req,res)=>{
    const key=req.body.key;
    const cipher=req.body.plaintext;
    let keyarr_=makematrix(key)
    console.log("cipher text arr:")
    let ciphertextarr=encrption(key,cipher)
    let det;
    let adjmat;
    if(keyarr_.length==2){
        det=((keyarr_[0][0]*keyarr_[1][1]-keyarr_[1][0]*keyarr_[0][1])+676)%26
        adjmat=adjmatrixtwo(keyarr_);
        printmat(adjmat);
    }
    else{
        det=keyarr_[0][0]*((keyarr_[1][1]*keyarr_[2][2])-(keyarr_[1][2]*keyarr_[2][1]))-keyarr_[0][1]*((keyarr_[1][0]*keyarr_[2][2]-(keyarr_[1][2]*keyarr_[2][0])))+keyarr_[0][2]*((keyarr_[1][0]*keyarr_[2][1])-(keyarr_[1][1]*keyarr_[2][0]));
        det=(det+70304)%26;
        adjmat=adjthree(keyarr_);
        printmat(adjmat);
    }
    console.log("det of arr:")
    console.log(det)
    console.log("inverse of det:")
    let inversedet=inversedeterminant(det)
    console.log(inversedet);
    let realkeyarr=[];
    for(let i=0;i<adjmat.length;i++){
        realkeyarr[i]=[]
        for(let j=0;j<adjmat[i].length;j++){
            realkeyarr[i][j]=(inversedet*adjmat[i][j])%26;
        }
    }
    console.log("this is real key arr: ");
    printmat(realkeyarr);
    let answer=[];
    for(let i=0;i<ciphertextarr.length;i++){
        answer[i]=matrixmul(realkeyarr,ciphertextarr[i]);
    }
    let charanswer=[]
    let final="";
    for(let j=0;j<answer.length;j++){
        charanswer[j]=[]
        for(let i=0;i<answer[j].length;i++){
            charanswer[j][i]=String.fromCharCode(answer[j][i]+97);
            final+=String.fromCharCode(answer[j][i]+97);
        }
    }
    console.log(final);
    let keyarr=makematrix(key);
    res.json({
        keyarr:keyarr,
        ciphertextarr:ciphertextarr,
        det:det,
        inversedet:inversedet,
        adjmat:adjmat,
        realkeyarr:realkeyarr,
        answer:answer,
        charanswer:charanswer,
        final:final
    })

})
app.listen(3000)