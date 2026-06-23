import fs from 'fs';
import https from 'https';
import TextToSVG from 'text-to-svg';

const file = fs.createWriteStream("pacifico.ttf");
https.get("https://github.com/google/fonts/raw/main/ofl/pacifico/Pacifico-Regular.ttf", function(response) {
  response.pipe(file);
  file.on("finish", () => {
    file.close();
    console.log("Download Completed");
    const textToSVG = TextToSVG.loadSync("pacifico.ttf");
    const options = {x: 0, y: 0, fontSize: 100, anchor: 'top', attributes: {fill: 'none', stroke: '#fbbf24', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'}};
    const path = textToSVG.getPath('Goooooooooooal!', options);
    fs.writeFileSync("path.txt", path);
    console.log("Path generated!");
  });
});
