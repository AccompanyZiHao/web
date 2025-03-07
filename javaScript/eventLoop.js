
// demo 1

setTimeout(function () {
  console.log(1);
}, 0);

function delay(duration) {
  var start = Date.now();
  while (Date.now() - start < duration) {}
}
delay(3000);
console.log(2);

// 输出 2 1


// demo 2



