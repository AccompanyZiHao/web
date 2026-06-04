import CodeCopy from './CodeCopy.vue'
import Vue from 'vue'

export default {
  updated() {
    // 防止阻塞
    setTimeout(() => {
      document.querySelectorAll('div[class*="language-"] pre').forEach(el => {
        // 防止重复写入
        if (el.classList.contains('code-copy-added')) return
        let ComponentClass = Vue.extend(CodeCopy)
        let instance = new ComponentClass()
        instance.code = el.innerText
        instance.$mount()
        // $mount() 的挂载会清空目标元素
        // 这里手动添加
        el.classList.add('code-copy-added')
        el.appendChild(instance.$el)
      })
    }, 100)
  }
}
