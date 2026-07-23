"use client"

import { useEffect } from "react"

export default function DisableInspect() {
  useEffect(() => {
    // Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // Disable Inspect & View Source Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 key
      if (e.keyCode === 123) {
        e.preventDefault()
        return false
      }

      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Windows / Linux DevTools)
      if (
        e.ctrlKey &&
        e.shiftKey &&
        (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)
      ) {
        e.preventDefault()
        return false
      }

      // Cmd+Option+I, Cmd+Option+J, Cmd+Option+C (Mac DevTools)
      if (
        e.metaKey &&
        e.altKey &&
        (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)
      ) {
        e.preventDefault()
        return false
      }

      // Ctrl+U or Cmd+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.keyCode === 85) {
        e.preventDefault()
        return false
      }

      // Ctrl+S or Cmd+S (Save Page)
      if ((e.ctrlKey || e.metaKey) && e.keyCode === 83) {
        e.preventDefault()
        return false
      }
    }

    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  return null
}
