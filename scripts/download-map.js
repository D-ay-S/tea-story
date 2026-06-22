import fs from 'fs';
import https from 'https';

const url = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';
const outputPath = 'D:\\TeaCulture\\tea-story1\\tea-story\\public\\china.json';

console.log('输出路径:', outputPath);

const file = fs.createWriteStream(outputPath);

https.get(url, (response) => {
  console.log('开始下载...');
  
  response.pipe(file);
  
  file.on('finish', () => {
    file.close(() => {
      console.log('地图数据下载完成！');
      
      fs.readFile(outputPath, 'utf8', (err, data) => {
        if (err) {
          console.error('读取文件失败:', err);
          return;
        }
        
        try {
          const json = JSON.parse(data);
          console.log('数据格式验证成功！');
          console.log(`包含 ${json.features?.length || 0} 个地理特征`);
        } catch (parseErr) {
          console.error('JSON解析失败:', parseErr);
        }
      });
    });
  });
}).on('error', (err) => {
  console.error('下载失败:', err);
  fs.unlink(outputPath, () => {});
});