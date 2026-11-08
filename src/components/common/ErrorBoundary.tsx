"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Studio Uncaught Client Exception:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch {
      this.setState({ hasError: false, error: null });
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-surface-0 flex flex-col items-center justify-center p-6 text-chalk select-none">
          <div className="max-w-md w-full bg-surface-1 border border-surface-border p-6 rounded-sm space-y-4">
            <div className="flex items-center gap-2.5 text-brand">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider">
                Studio Recovery Guard
              </h2>
            </div>

            <p className="text-xs text-steel leading-relaxed">
              The audio workstation encountered an environment state exception. Your project stems and settings are safely preserved.
            </p>

            {this.state.error && (
              <div className="p-2.5 bg-surface-0 border border-surface-border rounded-sm text-[11px] font-mono text-slateMuted truncate">
                {this.state.error.message || "Unknown runtime exception"}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-2 px-4 rounded-sm bg-brand hover:bg-brand-hover text-surface-0 text-xs font-mono font-bold transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Audio Engine</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
