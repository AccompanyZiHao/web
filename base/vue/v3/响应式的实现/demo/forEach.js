const set = new Set([1]);

// let total = 0;
// set.forEach((item) => {
//   set.delete(1);
//   set.add(1);
//
//   if (total === 10) {
//     throw new Error('无限循环 ， error');
//   }
//
//   total++;
//   console.log('循环 ing', total);
// });

/*
* forEach 在遍历 set 的时候，但是该值被重新添加到集合，会导致无限循环
* */

// 解决方案
const set2 = new Set(set);
set2.forEach((item) =>{
  set.delete(1);
  set.add(1);

  console.log('se2 循环');
})
