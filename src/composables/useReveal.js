import { onMounted, onBeforeUnmount } from 'vue'

/**
 * 滚动进入视口时为元素添加 .is-visible
 * 用法：根元素加 ref="root"，需要动画的子元素加 class="reveal"
 */
export function useReveal(rootRef) {
  let observer = null

  onMounted(() => {
    const root = rootRef.value
    if (!root) return
    const targets = root.classList?.contains('reveal')
      ? [root, ...root.querySelectorAll('.reveal')]
      : root.querySelectorAll('.reveal')

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )

    targets.forEach((t) => observer.observe(t))
  })

  onBeforeUnmount(() => observer && observer.disconnect())
}
