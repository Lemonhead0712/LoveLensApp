// Utility functions for smooth scrolling and navigation

export function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId)
  if (element) {
    const offset = 80 // Account for fixed header
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.scrollY - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    })
  }
}

export function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  })
}

// Hook to handle scroll-to-section on page load (for deep links)
export function useScrollToHash() {
  if (typeof window !== "undefined") {
    const hash = window.location.hash
    if (hash) {
      // Wait for DOM to be ready
      setTimeout(() => {
        const id = hash.replace("#", "")
        scrollToSection(id)
      }, 100)
    }
  }
}
