//map editer
Map_tools = {
  createNew:function(){
              var map_tools = {};
              var level = 1;
              var w = 600;
              var h = 600;
              var game_ctx = $('#canvas')[0].getContext("2d");
              var left_ctx = $('#left_canvas')[0].getContext("2d");
              map_tools.item_data = Item_data.createNew();
              game_ctx.w = $('#canvas').width();
              game_ctx.h = $('#canvas').height();
              var intervalId = 0
                var box_x =fastabs(game_ctx.w/30),box_y=20,box_w=30;box_h=30,bricks=new Array(box_x);
              var box_brush=-1,box_focus = [-1,-1];
              map_tools.init = function(){
                left_init();
                initbricks();
                map_tools.run();
              };
              map_tools.run = function(){
                intervalId = setInterval(make_boxs, 100);
              };
              var initbricks=function() {
                var str = '';
                for (i=0; i < box_y; i++) {
                  bricks[i] = new Array(box_x);
                  for (j=0; j <box_x; j++) {
                    var random_integer = Math.random()*12|0;
                    bricks[i][j] = random_integer;
                  }
                }
              };

              //显示可供选择的颜色  TODO 换成canvas显示
              var left_init = function(){
                for(i=0;i<13;i++)
                {
                  left_ctx.putImageData(map_tools.item_data.boxs[i],(i%6)*50,fastabs(i/6)*50);
                }

                for(i=0;i<9;i++)
                {
                  left_ctx.putImageData(map_tools.item_data.stars[i],(i%6)*50,(fastabs(i/6)+3)*50);
                }
              };

              $('#make_data').click(function(){
                var str = ""; 
                //清除下面的多余行
                var tmp_arr = bricks;
                for(i=tmp_arr.length-1;i>=0;i--)
              {
                var tmp = 0;
                for(j=0;j<tmp_arr[i].length;j++)
              {
                if(tmp_arr[i][j]>0)
              {
                tmp = i;break;
              }
              }
              if(tmp>0)break;
              }
              for(i=0;i<=tmp;i++)
              {
                str += tmp_arr[i].join()+"|"; 
              }
              str = window.location.href.replace("maptools.html","")+"?map_data="+str;
              var val = $('#input_array').val(str);
              });
              $('#make_map').click(function(){
                var val = $('#input_array').val();
                var arr = val.split("|");
                for(i=0;i<arr.length;i++)
              {
                var line = arr[i].split(",");
                for(j=0;j<line.length;j++)
              {
                bricks[i][j] = line[j];
              }
              }
              });
              $('#left_canvas').click(function(e){
                var x = Math.floor((e.pageX-$("#left_canvas").offset().left) / 50);
                var y = Math.floor((e.pageY-$("#left_canvas").offset().top) / 50);
                if(y>=3)
                box_brush = 100 + (y*6)+x-18;
                else
                box_brush = (y*6)+x;
              console.log(box_brush);
              });

              $('#canvas').click(function(e){
                var x = Math.floor((e.pageX-$("#canvas").offset().left) / box_w);
                var y = Math.floor((e.pageY-$("#canvas").offset().top) / box_h);
                if(box_brush !=-1){
                  bricks[y][x] = box_brush;
                }
              });

              //渲染
              var make_boxs = function()
              {

                var str = ""; 
                for (i=0; i < box_y; i++) {
                  for (j=0; j < box_x; j++) {
                    if(map_tools.item_data.boxs[bricks[i][j]])
                      game_ctx.putImageData(map_tools.item_data.boxs[bricks[i][j]],j*30,i*30);
                    else if(bricks[i][j]>=100)
                      game_ctx.putImageData(map_tools.item_data.stars[bricks[i][j]-100],j*30,i*30);
                  }
                  str += bricks[i].join()+"\n";
                }
                //$("#input_array").val(str);
              };
              return map_tools;
            }
};
