//for Game Map Data
//config it
var Item_data = {
  createNew:function(){
              var item_data = {};
              var box_img = new Image;
              var tmp_canvas=null;
              var data_to_load = {box_all:false,next_level:false,game_over_img:false,slider_sound:true};
              item_data.boxs = [];
              item_data.stars = [];
              item_data.ball = null;
              item_data.pad = null; 
              item_data.yoshi = {right:[],left:[],stay:[]};
              item_data.level = [];
              item_data.gameover_img = null;
              item_data.slider_img = null;
              item_data.slider_sound = null;
              var tmp_ctx = $('<canvas display=none></canvas>')[0].getContext("2d");
              $('body').bind("tmp_data_loaded",function(e,name){
                console.log(name+" loaded");
                var tmp =true;
                eval('data_to_load.'+name+'=true');
                $.each(data_to_load,function(i){
                  if(!data_to_load[i]) tmp = false;
                });
                if(tmp){
                  console.log("*** all game data loaded ***");
                $('body').trigger("game_data_loaded",true);
                }
              });
              var init = function(){
                console.log("*** start load data ***");
                box_img.src="game/image/box/box_all.png";
                box_img.onload = function(){
                  make_box_data();
                  make_stars_data();
                  make_pad_data();
                  make_yoshi();
                  make_ball_data();
                  make_slider_data();
                  $('body').trigger("tmp_data_loaded",["box_all"]);
                };
                item_data.get_next_level_data(0);
                item_data.make_gameover_img();
               // item_data.get_music();
              };
              item_data.get_music = function()
              {
                var tmp = new Audio;
                tmp.src = "game/music/slider.mp3";
                tmp.addEventListener("loadedmetadata",function(){
                  $('body').trigger("tmp_data_loaded",["slider_sound"]);
                  item_data.slider_sound = tmp;
                });
              }
              //获取下一关卡所需数据
              item_data.get_next_level_data = function(now_level){
                if(item_data.level[now_level] || !level_data[now_level]) return;
                item_data.level[now_level] = {};
                var bg_img = new Image;
                bg_img.src = level_data[now_level].img_src;
                bg_img.onerror = function(){
                  bg_img.src = level_data[0].img_src;
                };
                bg_img.onload = function(){
                  var tmp_ctx = $('<canvas display=none width=500 height=300></canvas>')[0].getContext("2d");
                  tmp_ctx.clearRect(0,0);
                  tmp_ctx.drawImage(bg_img,0,0,500,300,0,0,500,300);
                  item_data.level[now_level].bg_img = tmp_ctx.getImageData(0,0,500,300);                    
                  $('body').trigger("tmp_data_loaded",["next_level"]);
                  console.log(now_level +" level bg_img loaded");
                };
              };

              item_data.make_gameover_img = function(){
                var img = new Image;
                img.src = "game/image/background/IMG_0071.JPG";
                img.onload = function()
                {
                  var tmp_ctx = $('<canvas display=none width=500 height=300></canvas>')[0].getContext("2d");
                  tmp_ctx.clearRect(0,0);
                  tmp_ctx.drawImage(img,0,0,500,300,0,0,500,300);
                  item_data.gameover_img = tmp_ctx.getImageData(0,0,500,300);                    
                  $('body').trigger("tmp_data_loaded",["game_over_img"]);
                };

              };

              var make_box_data = function(){
                for(i=0;i<13;i++)
                {
                  tmp_ctx.drawImage(box_img,(i%10)*100,fastabs(i/10)*100,100,100,0,0,30,30);
                  item_data.boxs[i] = tmp_ctx.getImageData(0,0,30,30);                    
                }
              };
              var make_stars_data = function(){
                for(i=0;i<9;i++)
                {
                  tmp_ctx.drawImage(box_img,(i%10)*100,(fastabs(i/10)+2)*100,100,100,0,0,30,30);
                  item_data.stars[i] = tmp_ctx.getImageData(0,0,30,30);                    
                }
              };
              var make_ball_data = function(){
                var ball_ctx = $('<canvas display=none></canvas>')[0].getContext("2d");
                ball_ctx.drawImage(box_img,300,475,50,50,0,0,30,30);
                item_data.ball = ball_ctx.getImageData(0,0,30,30);                    
              };
              var make_slider_data = function(){
               var tmp_ctx = $('<canvas display=none width=400 height=50></canvas>')[0].getContext("2d");
                tmp_ctx.drawImage(box_img,400,550,400,100,0,0,400,50);
                item_data.slider_img = tmp_ctx.getImageData(0,0,400,50);                    
              };
              var make_pad_data = function(){
                tmp_ctx.clearRect(0,0);
                tmp_ctx.drawImage(box_img,0,475,300,40,0,0,150,20);
                item_data.pad = tmp_ctx.getImageData(0,0,150,20);                    
              };
              var make_yoshi = function(){    
		      var tmp_ctx = $('<canvas display=none width=480 height=40></canvas>')[0].getContext("2d");
		      tmp_ctx.clearRect(0,0);
		      tmp_ctx.drawImage(box_img,0,650,480,40,0,0,480,40);
		      for(i=0;i<4;i++)                
		      {
			      item_data.yoshi.right[i] = tmp_ctx.getImageData(i*40,0,40,40);
		      }
		      for(i=0;i<4;i++)                
		      {
			      item_data.yoshi.left[i] = tmp_ctx.getImageData(160+(4-i)*40,0,40,40);
		      }
		      item_data.yoshi.stay[0] = tmp_ctx.getImageData(325,0,40,40);
	      };

              init();
              return item_data;
            }
};
