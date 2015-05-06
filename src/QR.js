//Construrctor function
function QR(container){

  if(!window.QRCounter){
    window.QRCounter = 0;
  }

  window.QRCounter++;

  this.qrReader = new QrCode();
  this.container;
  this.initialized = false;
  this.scanning = false;
  this.sources = [];
  this.ID = window.QRCounter;
  this.videoSelect;
  this.video;
  this.canvas;
  this.context
  this.resultViewer;
  this.localMediaStream;
  this.timeOut;

  this.scanningCallback = null;
  this.initCallback = null;

  if(container){
    if( $('#'+container) ){
      this.container = $('#'+container);
    } else {
      alert("There is no "+ container+ " container!");
    }
  } else {
    this.container = $('<div class="common" id="common'+this.ID+'"></div>').appendTo('body');
  }

  this.container.data('this', this);

};

QR.prototype = (function() {

    //******************
    //Private functions
    //******************
    var buildVideoSelect = function() {
      var self = this;
      if (typeof MediaStreamTrack === 'undefined'){
          alert('This browser does not support MediaStreamTrack.\n\nTry Chrome Canary.');
      } else {
          this.videoSelect = $('<select id="videoSource"></select>').insertBefore(this.container);
          MediaStreamTrack.getSources(function(data){
            gotSources(data, self);
          });
      }
    };

    var gotSources = function(sourceInfos, self) {
      var self = self;
        var counter = 0;
        for (var i = 0; i !== sourceInfos.length; ++i) {
            var sourceInfo = sourceInfos[i];
            var option = document.createElement('option');
            option.value = sourceInfo.id;
            if (sourceInfo.kind === 'video') {
                option.text = sourceInfo.label || 'camera ' + (self.videoSelect.length + 1);
                self.videoSelect.append(option);
                self.sources.push(sourceInfo);
            } else {
                counter++;
            }
        }

        $('select').addClass("form-control");
    };

    /**
    * If the video element source and stream has already set, then this function clear it,
    * set it default and make a new video stream with the selected source.
    */
    var setVideoStream = function(){

      if (!!this.container.data('stream'))
      {
          this.container.data('stream').stop();
          this.video.src = null;
          //window.stream.stop();
          //clearTimeout(this.container.data('timeout'));
          this.scanning = false;
          clearTimeout(this.timeOut);
          this.timeOut = null;

          var videoSource = this.videoSelect[0].value;

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
      } else
      {
          var constraints = {video : true};
      }
      var self = this;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

      navigator.getUserMedia(constraints, function(data){
        successCallback(data, self);
      }, function(error) {
        console.log(error);
      });
    };


    var scan = function(self) {
      var self = self;
      var canvasDataUrl;
        if ( self.localMediaStream && self.scanning == true && self.initialized == true ) {
            try {


              self.context.drawImage(self.video, 0, 0);
              canvasDataUrl = self.canvas[0].toDataURL();

              self.qrReader.decode(canvasDataUrl);

              self.qrReader.callback = function (result) {
                if(result){
                  self.scanningCallback(result);
                } else {
                  self.timeOut = setTimeout(function(){
                    scan(self);
                  }, 500);
                }
              };
            } catch (e) {
                  console.log(e);
                  self.timeOut = setTimeout(function(){
                    scan(self);
                  }, 500);
            }
        }

    };

    var successCallback = function(stream, self) {

      var self = self;

      window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

        self.video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
        self.localMediaStream = stream;

        self.container.data('stream', stream);

        console.log(self.video.currentSrc);
        self.video.autoplay = true;
        self.video.play();
    };
    //**********************
    //Private functions END
    //**********************

    //Static part of object
    return {

        constructor: QR,

        init: function() {
          if(this.initialized == true){
            console.log('This camera has already initialized...')
            return false;
          }
          buildVideoSelect.call(this);

          var self = this;
          var width;
          var height;
          if (width == null) {
              width = 640;
          }

          if (height == null) {
              height = 480;
          }

          var videoJQ = $('<video width="320" height="240"></video>').appendTo(this.container);
          this.video = videoJQ[0];
          this.canvas = $('<canvas id="qr-canvas" width="' + (width - 2) + 'px" height="' + (height - 2) + 'px" style="display:none;"></canvas>').appendTo(this.container);
          this.context = this.canvas[0].getContext('2d');
          this.resultViewer = $('<a href="results" id="resultViewer" class="hidden" role="button">View Results</a>').appendTo(this.container);

          setVideoStream.call(this);

          this.videoSelect[0].onchange = function(){
            setVideoStream.call(self);
          };

          this.initialized = true;
        },

        startScanning: function(qrcodeSuccess){
          var self = this;

          if(this.scanning == true){
            console.log('Already scanning!');
            return;
          }

          if(!this.initialized){
            console.log('Please initialize the QR object first! this.initialized = ' + this.initalized + ' now.');
            return;
          }

          //This section give time for callbacks in initialize part, SECTION 1
          var tempTimeOut;
          var qrcodeSuccess = qrcodeSuccess;

          if ( !(this.localMediaStream && this.initialized == true) ) {
            tempTimeOut = setTimeout(function(){
              self.startScanning(qrcodeSuccess);
            }, 100);
            console.log(tempTimeOut);
            return false;
          }
          //SECTION 1 END


          this.scanning = true;

          this.scanningCallback = function(result){
            if(!qrcodeSuccess){
              if (this.scanning == true)
              {
                  this.scanning = false;
                  clearTimeout(this.timeOut);
                  this.timeOut = null;
              }
              console.log(result);
              alert('Please, write callback to startScanning() function!');
            } else{
              if (this.scanning == true)
              {
                  this.scanning = false;
                  clearTimeout(this.timeOut);
                  this.timeOut = null;
              }
              qrcodeSuccess(result);
            }
          }

          scan(self);
        },

        stopScanning: function(){
          if (this.scanning == true)
          {
              this.scanning = false;
              clearTimeout(this.timeOut);
              this.timeOut = null;
          }
          console.log('Scanning and streaming stopped')
        }

    };
})();
