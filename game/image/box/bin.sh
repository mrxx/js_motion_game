#批量修改图片名称，刚刚地
for f in box_*图层*.png;do mv $f box.`ls $f |awk -F '-' '{print $2}' `;done


