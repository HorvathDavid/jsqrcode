# JavaScript QRCode reader for HTML5 enabled browser.

This is a port of edi9999 object kind port of Lazarsoft’s qrcode reader

You need to have the following technologies:
- JQuery
- HTML5 enabled browser (Chrome tested), on Firefox need some adjustments
- at least a simple http server for serve static files (if you try to test locally, example "file:///index.html" some HTML5 features do not enabled, like camera)
- you better to have secured http(s) to allow the camera permanently, otherwise the browser will always ask permission to use the camera

# Usage

Include the scripts into you main HTML file in the following order:

    <script type="text/javascript" src="grid.js"></script>
    <script type="text/javascript" src="version.js"></script>
    <script type="text/javascript" src="detector.js"></script>
    <script type="text/javascript" src="formatinf.js"></script>
    <script type="text/javascript" src="errorlevel.js"></script>
    <script type="text/javascript" src="bitmat.js"></script>
    <script type="text/javascript" src="datablock.js"></script>
    <script type="text/javascript" src="bmparser.js"></script>
    <script type="text/javascript" src="datamask.js"></script>
    <script type="text/javascript" src="rsdecoder.js"></script>
    <script type="text/javascript" src="gf256poly.js"></script>
    <script type="text/javascript" src="gf256.js"></script>
    <script type="text/javascript" src="decoder.js"></script>
    <script type="text/javascript" src="qrcode.js"></script>
    <script type="text/javascript" src="findpat.js"></script>
    <script type="text/javascript" src="alignpat.js"></script>
    <script type="text/javascript" src="databr.js"></script>
    <script type="text/javascript" src="QR.js"></script>

1. ( modify the code as it is needed )
2. Initialize QR object
3. Start scanning 
4. Write callback for scanning (if callback is success the scanning will be stopped automaticly)

Example:

```javascript
<script>
	//If you give container paramter, it will find you the right HTML element by #id.
	var qr = new QR('container');
            qr.init();
            qr.startScanning(function(data){
            	// Here should write the callback
                console.log(data);
            });
            qr.stopScanning();
</script>
```

# For performace tuning 
- please check the "scan()" function in QR.js and set the timeOuts. Default 500 ms.
- play with the constraints, now it looks like below

```javascript
var constraints = {
	video: {
		"mandatory": {
			"minWidth": "320",
			"minHeight": "240",
			"maxWidth": "320",
			"maxHeight": "240",
			"maxFrameRate": "30"
		},
		"optional": [{"sourceId": videoSource}]
	}
};
```

