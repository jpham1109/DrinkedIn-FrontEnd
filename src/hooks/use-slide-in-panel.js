import { useState } from 'react'

const useSlideInPanel = () => {
	const [isPanelOpen, setIsPanelOpen] = useState(false)
	const [unauthorizedAction, setUnauthorizedAction] = useState('')
	const openPanel = (unauthorizedAction) => {
		setIsPanelOpen(true)
		if (unauthorizedAction) {
			setUnauthorizedAction(unauthorizedAction)
		}
	}
	const closePanel = () => {
		setIsPanelOpen(false)
		setUnauthorizedAction('')
	}

	return { isPanelOpen, openPanel, closePanel, unauthorizedAction }
}

export default useSlideInPanel
