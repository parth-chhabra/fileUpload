const Koa = require('koa');
const Router = require('koa-router');
const utils = require('sm-utils');
const koaStatic = require('koa-static');
const koaBody = require('koa-body');
const fs = require('fs');
// const aws = require('aws-sdk');

const app = new Koa();
const router = new Router()
const port = process.env.PORT || 8080;

app.use(koaStatic(__dirname + '/dist'));
app.use(koaBody({multipart: true}));

// const s3Bucket = new aws.s3({
//     accessKeyId: '',
//     secretAccessKey: '',
//     Bucket: '',
// });

router.get('/(.*)', async (ctx) => {
    const html = await utils.file('./dist/index.html').read();
    ctx.type = 'text/html';
    ctx.body = html;
});

async function isUserLoggedIn(ctx, next) {
    if (ctx.request.headers.user) {
        console.log('User Authenticated');
        await next();
        return;
    }
    console.log('user not authenticated');
    ctx.status = 200;
    ctx.body = {
        type: 'Authentication failure',
        data: 'user not authenticated',
    };
    return;
}

// async function uploadToS3(name, stream) {
//     s3Bucket.upload({
//         key: name,
//         body: stream,
//     }, (err, data) => {
//         if (err) console.log(err)
//         console.log(data);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
//     });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
// }

async function uploadImage(file, readStream) {
    const name = Math.random().toString(32).slice(2,7);
    console.log('imageName: ', name);
    const image = utils.file(readStream.path);
    await image.mv(`${name}`);
    // uploadToS3(name, readStream);
}

router.post('/upload', isUserLoggedIn, async (ctx) => {
    console.log('Uploading Image');
    const file = ctx.request.files.image;
    const readStream = fs.createReadStream(file.path);
    const url = await uploadImage(file, readStream);
    ctx.body = {
        type: 'success',
        data: url,
    }
});

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(port, () => {
    console.log('Listening on port: ', port);
});
