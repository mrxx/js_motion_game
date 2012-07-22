Motion_head = {
  createNew:function(){
              var motion_head = {};
              motion_head.x=0;motion_head.y=0,motion_head.postion_x=0;motion_head.postion_y=0;
              var video = document.querySelector('#basic-stream');
              var video_width=0,video_height=0;
              var tmp_ctx = $('<canvas id="screenshot_canvas" width="30" height="24" display=none></canvas>')[0].getContext("2d");
              var mosaic_ctx = $('#mosaic_canvas')[0].getContext('2d');
              var localMediaStream = false,is_webkit=false;
              var mosaic={width:30,height:24,big_width:300,big_height:240,data_length:30*24}; 
              var mosaic_array = [];
              var mosaic_switch_data = [];
              //两个常数，用于调整颜色差值和灵敏度 10/3< motion_sensitivity <10
              var video_threshold = 15,motion_sensitivity = 5; 
              var motion_array = new Object; 
              var motion_snapshot = [];

              motion_head.init = function(){
                // start
                console.log("start video");
                if (navigator.getUserMedia) {
                  navigator.getUserMedia('video', successCallback, errorCallback);
                }else if(navigator.webkitGetUserMedia){
                  is_webkit = true;
                  if($.browser.safari && $.browser.version>536)
                    navigator.webkitGetUserMedia({video:true}, successCallback, errorCallback);
                  else
                    navigator.webkitGetUserMedia('video', successCallback, errorCallback);
                }else
                {
                  errorCallback({code:1,message:'error'});
                }
                function successCallback(stream) {
                  window.root_stream = stream;
                  if (is_webkit) {
                    video.src = window.webkitURL.createObjectURL(stream);
                  } else {
                    video.src = stream;
                  }
                }
                function errorCallback(error) {
                  $("#alert_Modal").modal({});
                  console.error('An error occurred: [CODE ' + error.code + ']');
                  return;
                }
                video.addEventListener("loadedmetadata", function () {
                  console.log("loadedmetadata");
                  video_width = video.videoWidth;
                  video_height = video.videoHeight;
                  tmp_ctx.width = video.videoWidth;
                  tmp_ctx.height = video.videoHeight;
                  localMediaStream = true;
                });
                //end
              };
              motion_head.run = function(){
                draw();
              };
              //not get the camera
              var onFailSoHard =function(e) {
                console.log(e);
                if (e.code == 1) {
                  alert('User denied access to their camera');
                } else {
                  alert('getUserMedia() not supported in your browser.');
                }
              }
              //开始渲染
              function draw() {
                if (localMediaStream) {
                  root_loaded = 1;//视频载入
                  tmp_ctx.clearRect(0,0,tmp_ctx.width,tmp_ctx.height);
                  tmp_ctx.drawImage(video,0,0,tmp_ctx.width,tmp_ctx.height,0,0,mosaic.width,mosaic.height);//将视频数据写入canvas
                  var motion_snapshot = tmp_ctx.getImageData(0,0,mosaic.width,mosaic.height).data;
                  if(!mosaic_switch_data.length)
                  {
                    mosaic_switch_data = motion_snapshot;
                  }else
                  {
                    // TODO 计算两祯的差值，即可确定头的位置,不用两次差值去计算
                    var blendedData = differenceAccuracy(motion_snapshot, mosaic_switch_data);
                    mosaic_switch_data = motion_snapshot;
                    if(window.DEBUG || 1){ //画马赛克图案
                      mosaic_ctx.clearRect(0,0,mosaic.big_width,mosaic.big_height);
                      for(i=0;i<blendedData.length;i++)
                      {
                        for(j=0;j<blendedData[i].length;j++)
                        {
                          if(blendedData[i][j])
                            mosaic_ctx.fillRect(j*10,i*10,10,10);
                        }
                      }
                    }//end debug
                  }
                }
              }

              //拍照
              motion_head.snapshot = function(){
                if (localMediaStream) {
                  console.log("take a snapshot");
                  var tmp = $('<canvas width="300" height="240"></canvas>');
                    var tmp_ctx = tmp[0].getContext("2d");
                  tmp_ctx.drawImage(video,0,0,300,240,0,0,mosaic.big_width,mosaic.big_height);
                    var imgData =tmp[0].toDataURL("image/png");
                  $("#avatar").html(tmp);
                  $("#share_avatar").val(tmp[0].toDataURL("image/png"));
                }      
              };

              //计算马赛克值，压缩图片
              make_mosaic = function()
              {
                //drawImage自带压缩啊，知道真相的我眼泪掉下来
                var tmp_ctx_data = tmp_ctx.getImageData(0, 0, 300, 240);
                var n = 0,tmp_w = tmp_ctx_data.width,tmp_h = tmp_ctx_data.height;
                var pixelArray=tmp_ctx_data.data;
                for(var i=0;i<tmp_ctx_data.height;i+=mosaic.height){
                  var tmp_row = fastabs(i/mosaic.height);
                  if(!mosaic_array[tmp_row])mosaic_array[tmp_row] = [];
                  for(var j=0;j<tmp_ctx_data.width;j+=mosaic.width){
                    var tmp_col = fastabs(j/mosaic.width);
                    if(!mosaic_array[tmp_row][tmp_col]){
                      var num=Math.random();
                      var randomPixel={x:fastabs(num*mosaic.width),y:fastabs(num*mosaic.height)};                        
                      mosaic_array[tmp_row][tmp_col] = randomPixel;
                    }else
                    {
                      var randomPixel = mosaic_array[tmp_row][tmp_col];		
                    }
                    var tmp_point = (fastabs(tmp_row*tmp_w/mosaic.height)+tmp_col)*4;
                    var tmp_real_point = (j+randomPixel.x)*(i+randomPixel.y)*4;//
                    //存入此帧压缩后数据
                    motion_snapshot[tmp_point] = pixelArray[tmp_real_point];
                    motion_snapshot[tmp_point+1] = pixelArray[tmp_real_point+1];
                    motion_snapshot[tmp_point+2] = pixelArray[tmp_real_point+2];
                    motion_snapshot[tmp_point+3] = pixelArray[tmp_real_point+3];
                  } 
                }
              }
              //求差值，计算运动区域
              var differenceAccuracy=function(data1,data2) {//求帧差值
                if (data1.length != data2.length) return null;
                var target = [];
                var i = 0;
                var sum_x = 0; 
                //var sum_y = 0;
                var point = 0;
                //TODO 加入mosaic的计算，减少计算量
                var data_length = data1.length*0.25;
                while (i < data_length) {
                  //灰度计算
                  var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2])/3;
                  var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2])/3;
                  var diff = fastabs(average1-average2)>video_threshold ? 1 : 0;//求差值
                  var tmp_y = fastabs(i/mosaic.width);
                  var tmp_x = i%mosaic.width;
                  if(!target[tmp_y])target[tmp_y] = [];
                  target[tmp_y][tmp_x] = diff;
                  //TODO 焦点计算，坐标计算
                  if(diff !=0){
                    sum_x += i%mosaic.width;
                    //sum_y += fastabs(i/mosaic.height);
                    point +=1;
                  }
                  ++i;
                }
                //返回运动区域所在百分比
                if(point>10){
                  motion_head.postion_x =100-(sum_x/point)*motion_sensitivity;
                  //motion_head.postion_y = 85-(sum_y/point)*3.333;
                }
                return target;
              };

              var threshold = function(value) {
                return (value > video_threshold) ? 1 : 0;
              };

              return motion_head;
            }
};

