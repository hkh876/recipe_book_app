import { Backdrop, CircularProgress } from "@mui/material"
import { useEffect, useState } from "react"

interface LoadingProps {
  open: boolean // if true, show loading
}

const Loading = ({ open }: LoadingProps) => {
  // state
  const [loading, setLoading] = useState(open)

  // default 1 sec delay
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setLoading(false)
      }, 1000)

      return () => clearTimeout(timer)
    } else {
      setLoading(true)
    }
  }, [open])

  return (
    <>
      <Backdrop sx={{ zIndex: "1301"}} open={loading}>
        <CircularProgress color={"inherit"} size={70} />
      </Backdrop>
    </>
  )
}

export default Loading