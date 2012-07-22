function fastabs(value) {
    return (value ^ (value >> 31)) - (value >> 31);
}
function stop_game(){
clearInterval(intervalId);
}
function getUrlParam(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)"); 
    var r = window.location.search.substr(1).match(reg); 
    if (r!=null) return unescape(r[2]); return null; 
} 
//TODO 上传至排行榜
function upload_and_rank()
{
  var url = "http://kaopulove.com/rank/game_rank_save";
  var postdata = {rank:12,avatar:"test"};
  $.ajax({
    type: "POST",
    url: url,
    data: postdata,
    dataType: 'jsonp',
    success:function(){
    }
  });

}

