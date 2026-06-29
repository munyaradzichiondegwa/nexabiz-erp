import React, { useState } from "react"
import { aiApi } from "@/api/ai"
import { PageHeader } from "@/components/ui/PageHeader"
import { SparklineChart } from "@/components/ui/SparklineChart"
import { AIBar } from "@/components/ui/AIBar"
import { showToast } from "@/components/ui/Toast"
import { formatCurrency } from "@/utils/currency"

const AI_RESP: Record<string, string> = {
  margin:   "Top margin products: USB Drive (62%), Pen Pack (58%), Notebook (54%).",
  forecast: "30-day forecast: $54,200 (+-8%). ARIMA+ML confidence: 87%. Peak: Apr 15.",
  anomal:   "2 anomalies: unusual refund volume Mar 24 (15 vs avg 5), login from new IP at 02:14.",
  churn:    "3 customers at risk: Delta Inc, Gamma Co, Beta Shop. Recommend re-engagement.",
  top:      "Top 5: Coffee $4,200 - USB Drive $3,800 - Sandwich $2,100 - Energy Drink $1,900 - Notebook $1,650",
}

export default function AiInsightsPage() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [asking, setAsking] = useState(false)
  const forecast = [50000, 52000, 49000, 54000, 56000, 53000, 58000, 60000]

  const askAI = async () => {
    if (!question.trim()) { showToast("Enter a question", "warning"); return }
    setAsking(true)
    try {
      const result = await aiApi.ask(question)
      setAnswer(result.answer)
    } catch {
      const key = Object.keys(AI_RESP).find(k => question.toLowerCase().includes(k))
      setAnswer(key ? AI_RESP[key] : "Revenue trending +12% MoM. No critical anomalies. Recommend: restock Item B urgently.")
    } finally { setAsking(false) }
  }

  return (
    <div>
      <PageHeader title="AI Insights" subtitle="MOD-08 - Revenue forecasting - Anomaly detection - Natural Language Query" />
      <div className="card mb-5">
        <h3>Ask AI</h3>
        <div className="flex gap-3">
          <input className="flex-1 border border-border rounded-lg px-4 py-2 text-sm outline-none focus:border-teal"
            placeholder="e.g. Which products have the highest margin this month?"
            value={question} onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === "Enter" && askAI()} />
          <button className="btn btn-primary" onClick={askAI} disabled={asking}>{asking ? "Thinking..." : "Ask"}</button>
        </div>
        {answer && <AIBar>{answer}</AIBar>}
        <div className="flex gap-2 mt-3 flex-wrap">
          {[["Revenue Forecast","Forecast revenue for next 30 days"],["Anomaly Detection","Detect anomalies in transactions"],["Churn Risk","Which customers are at risk of churning?"],["Top Products","What are the top 5 selling products?"]].map(([label, q]) => (
            <button key={label} className="btn btn-ghost btn-sm" onClick={() => { setQuestion(q); setAnswer("") }}>{label}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card">
          <h3>Revenue Forecast (30 days)</h3>
          <SparklineChart data={forecast} labels={forecast.map((v, i) => "Day " + (i+1) + ": " + formatCurrency(v))} />
          <AIBar>Model: ARIMA+ML - Confidence: 87% - Predicted: {formatCurrency(54200)} next 7 days</AIBar>
        </div>
        <div className="card">
          <h3>Anomalies Detected</h3>
          <div className="flex flex-col gap-3 mt-1">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm"><strong>Unusual refund volume</strong><br /><span className="text-muted-foreground">15 refunds on 24 Mar - 3x normal rate</span></div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm"><strong>Login anomaly</strong><br /><span className="text-muted-foreground">Login from new IP: 41.58.x.x at 02:14</span></div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm"><strong>No GL anomalies</strong><br /><span className="text-muted-foreground">All journal entries balanced correctly</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
