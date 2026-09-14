import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="bg-brutal-grid flex min-h-dvh items-center justify-center p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        <div className="card-insight w-full max-w-lg p-6">
          <p className="caption-brutal">Layar macet</p>
          <h1 className="font-display mt-2 text-[clamp(28px,4vw,40px)]">Ada yang error</h1>
          <p className="mt-3 font-bold">
            Coba refresh halaman. Kalau masih hitam/kosong, hapus data situs lalu buka ulang.
          </p>
          <p className="mt-3 break-all text-sm font-bold opacity-70">
            {this.state.error.message}
          </p>
          <button
            type="button"
            className="btn-brutal btn-brutal-primary mt-6"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }
}
