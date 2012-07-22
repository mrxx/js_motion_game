//Game class
//TODO
/* *clearRect主要是耗显卡导致cpu上升了。最好能区域更新
 * *音乐
 * *
 * */
  var Game = {
  createNew: function(){
               var game={};
               game.item_data = Item_data.createNew();;
               game.ctrl = 'head';//手控制还是头控制 head|hand
               game.begin_x = 0;//开始行，用于控制往下推
               game.level = 0;//当前关卡
               game.timeback = 0;//回到过去
               game.mark = 0;//分数
               game.locked = true;//默认锁定
               var game_ctx = $('#canvas')[0].getContext("2d");
               game_ctx.w = $('#canvas').width();
               game_ctx.h = $('#canvas').height();
               game_ctx.bg_img = false;
               var ball_x = 150,ball_y = game_ctx.h-30,ball_r=20,ball_speed_x = 2,ball_speed_y = 5,ball_width=30,ball_height=30,ball_spring=0.8;
               var padw=150,padh=30,padx=fastabs(game_ctx.w/2)-fastabs(padw/2),pady=game_ctx.h-padh,pad_speed_x=5,pad_speed_y=10,motion_last_y=0,yoshi_frame=0;
               var rightDown=false,leftDown=false,upDown=false,downDown=false,shiftDown=false;
               var right_key=68,left_key=65,up_key=87,down_key=83,shift_key=16;
               var box_x =fastabs(game_ctx.w/30),box_y=10,box_w=30;box_h=30,box_spring=0.8;
               var bricks=new Array(box_y),bricks_row=[];

               game.init = function()
               {
                 init_level();
                 $(document).keydown(onKeyDown);
                 $(document).keyup(onKeyUp);
               };
               //start run game every 10/1000 sec
               game.run = function()
               {
                 draw(); //渲染
               };
               //渲染
               var draw = function(){
                 //draw a circle
                 if(game.locked)
                 {
                   //game_ctx.clearRect(0,0,game_ctx.w,game_ctx.h);
                   move_pad(); //移动拍子
                   unlock();
                 }else
                 {
                   game_ctx.clearRect(0,0,game_ctx.w,game_ctx.h);
                   make_boxs();//渲染地图
                   circle(ball_x,ball_y);//渲染球
                   move_ball();//移动球
                   move_pad(); //移动拍子
                   hitTest();//碰撞检测
                 }
                 //结束游戏
                 if(ball_y>game_ctx.h && !game.locked)
                   gameover();
               };
               //滑动开锁
               var unlock = function(){
                  if(!game_ctx.bg_img)
                  {
                    game_ctx.clearRect(0,0,game_ctx.w,game_ctx.h);
                    game_ctx.putImageData(game.item_data.level[game.level].bg_img,50,50);
                    game_ctx.putImageData(game.item_data.slider_img,100,400);
                    game_ctx.bg_img = true;
                    padx = 0;
                    //滑动条 TODO
                  }
                  if(padx >= (game_ctx.w-padw-200))
                  {
                    console.log('unlocked level '+game.level);
                    game.locked = false;
                    game.item_data.get_next_level_data(game.level+1);
                    ball_x = 150;ball_y = game_ctx.h-30;ball_speed_y = -fastabs(ball_speed_y);
                    ball_y -=100;
                  }
               }
               //锁定
               var lock = function()
               {
               
               }
               // game over
               var gameover = function()
               {
                 game.locked = true;
                 game_ctx.bg_img = false;
                 if(game.ctrl=='head')window.motion_head.postion_x = 0;
                 padx = 0;
                 //over 图片
                 game.item_data.level[game.level].bg_img = game.item_data.gameover_img;
                 if(level_data[game.level])
                   init_level();
               }

               //进入下一关卡  
               var next_level = function()
               {
                 game.locked = true;
                 game_ctx.bg_img = false;
                 padx = 0;
                 game.level +=1;
                 // 通关
                 if(game.level >= level_data.length)
                 {
                   stop_game();
                   return;
                 }
                 $("#game_level").html("Round: "+(game.level+1));
                 if(level_data[game.level])
                   init_level();

                 //拍照
                 /*
                 window.motion_head.snapshot();
                 $("#share_Modal").modal({});
                 console.log("share the mark");
                 */


               }
               //初始化地图及一些参数
               var init_level=function() {
                 //load bricks of this level
                 bricks=[],bricks_row=[];
                 //获取自定义参数地图
                 var map = getUrlParam('map_data');
                 if(!map)
                   map = level_data[game.level].map;
                 
                 //初始化锁屏图片 
                 game.item_data.get_next_level_data(game.level);
                 //初始化地图
                 var arr = map.split("|");
                 for(i=0;i<arr.length;i++)
                 {
                   if(arr[i]){
                     bricks[i] = arr[i].split(",");
                     bricks_row[i] = 0;
                     for(j=0;j<bricks[i].length;j++)
                     {
                      if(bricks[i][j]>0)
                        bricks_row[i]++;
                     }
                   }
                 }
               };

               var clear = function(){// 清理场景
                 game_ctx.clearRect(0,0,game_ctx.w,game_ctx.h);
               };
               var circle=function(x,y) {//画园
                 game_ctx.putImageData(game.item_data.ball,x,y);
               };
  
              //重绘盒子
               var make_boxs = function()
               {
                 if(bricks_row.length>box_y)
                 var line = bricks_row.length - box_y; //开始行
                 else
                 {
                   box_y = bricks_row.length;
                   var line = 0;
                 }
                 for (i=0; i < box_y; i++) {
			 for (j=0; j < box_x; j++) {
				 if (bricks[line+i] && bricks[line+i][j] >=0 && bricks[line+i][j]<100) {   
					 game_ctx.putImageData(game.item_data.boxs[bricks[line+i][j]],j*box_w,i*box_h);
				 }else if(bricks[line+i][j]>=100){
					 game_ctx.putImageData(game.item_data.stars[bricks[line+i][j]-100],j*box_w,i*box_h);
                     }
                   }
                 }
               };

               //碰撞砖块检测
               var hitTest = function(){
                 //TODO 加入碰撞算法 
                 var row_b =fastabs(ball_y/box_h); //[fastabs(ball_y/box_h),fastabs(ball_y/box_h+0.5)];
                 var col_b =fastabs(ball_x/box_w);// [fastabs(ball_x/box_w),fastabs(ball_x/box_w+0.5)];
                 is_hit(row_b,col_b);
                 //hit the pad
                 if(ball_speed_y>0 && (ball_y+ball_height)>=pady && ball_x>=padx && ball_x<=(padx+padw+ball_width))
                 {
                   ball_speed_y=-ball_speed_y;
                 }

               };
               var is_hit = function(row,col){
                   //计算碰撞
                   line = bricks_row.length<box_y ? 0 : bricks_row.length-box_y;
                   //hit the box
                   if(bricks[line+row] && bricks[line+row][col]>0 && ball_y<box_y*box_h && row>=0 && col>=0) {
                     //TODO shift 特殊键 需要将更多道具做成配置文件
                     if(bricks[line+row][col] == 104)
                     {
                       game.timeback +=1;
                       $("#game_timemachine").html("TimeMachine: "+game.timeback);
                     }
                     //更新积分
                     game.mark += parseInt(bricks[line+row][col]);
                     $("#game_mark").html("Mark: "+game.mark);
                     bricks_row[line+row] -=1;
                     ball_speed_y = -ball_speed_y;
                     bricks[line+row][col] = 0;
                     //清除空白的行
                     if(line >0 && bricks_row[line+row] <=0){
                       bricks_row.splice(line+row,1);
                       bricks.splice(line+row,1);
                     }else if(bricks_row.length<=box_y){
                       if(parseInt(bricks_row.join("")) <=0)
                       {
                         console.log(game.level+" level passed");
                         next_level();
                       }
                     }
                   }
               };
               //移动球
               var move_ball = function(){
                 ball_x+=ball_speed_x;
                 ball_y+=ball_speed_y;
                 if(ball_x>game_ctx.w || ball_x<0)
                   ball_speed_x=-ball_speed_x;
                 if(ball_y+ball_speed_y<0)
                   ball_speed_y=-ball_speed_y;
                 //时光倒流时无法碰撞
                 if(shiftDown) //TODO 自动找ball的 height
                 {
                   //box_y += -2*ball_speed_y;
                   ball_y +=-ball_speed_y*2;
                   ball_x +=-ball_speed_x*2;
                 }

                 //测试模式
                 if(window.DEBUG && ball_y+ball_speed_y+30>game_ctx.h)
                   ball_speed_y=-ball_speed_y;
                 //TODO 加入弹簧算法
               };
               //移动拍子
               var move_pad = function()
               {
                 var yoshi_dir="";
                 var speed =0;
                 if(game.ctrl == 'hand')
                 {
                   if(rightDown) speed = pad_speed_x;
                   else if(leftDown) speed = -pad_speed_x;
                 }else if(game.ctrl =='head')
                 {
                   if(fastabs(window.motion_head.postion_x-game_ctx.w)>(10+pad_speed_x))
                     var tmp = game_ctx.w*window.motion_head.postion_x/100;
                   speed = (tmp-padx)/pad_speed_x;
                 }
               //make a move
               padx += speed;

               //if(fastabs(speed)>10)game.item_data.slider_sound.play();

               if(padx<0)padx=0;
               if(padx>(game_ctx.w-padw))padx=game_ctx.w-padw;

                 game_ctx.putImageData(game.item_data.pad,padx,pady);

	       /*
               if(speed>0){//right
                  game_ctx.putImageData(game.item_data.yoshi.right[yoshi_frame],padx,pady);
               }else if(speed<0)//left
               {
                  game_ctx.putImageData(game.item_data.yoshi.left[yoshi_frame],padx,pady);
               }else //stay
               {
                  game_ctx.putImageData(game.item_data.yoshi.stay[0],padx,pady);
               }
               if((++yoshi_frame)>3)yoshi_frame=0;
*/
               };

               var  onKeyDown = function(evt){
                 var k =evt.keyCode;
                 if(game.ctrl =='head' && (game.timeback< 1 || k !=shift_key) ) return;
                 if(k == right_key)
                   rightDown=true;
                 else if(k == left_key)
                   leftDown=true;
                 else if(k == up_key)
                   upDown=true;
                 else if(k == down_key)
                   downDown=true;
                 else if(k == shift_key)
                 {
                   game.timeback -=1
                   shiftDown=true;
                 }
               };
               var onKeyUp = function(evt){
                 var k =evt.keyCode;
                 if(k == right_key)
                   rightDown=false;
                 else if(k == left_key)
                   leftDown=false;
                 else if(k == up_key)
                   upDown=false;
                 else if(k == down_key)
                   downDown=false;
                 else if(k == shift_key)
                   shiftDown=false;
               };

              return game;
             }
  };
