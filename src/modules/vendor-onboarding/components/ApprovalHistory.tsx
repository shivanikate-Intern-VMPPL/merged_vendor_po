import { useEffect, useState } from "react";
import { supabase } from "../supabase.js";

interface ApprovalHistory {
  id: number;
  vendor_id: number;
  approver_id: number;
  approver_role: string;
  approval_level: number;
  action: string;
  comments: string | null;
  created_at: string;
}

export default function ApprovalHistory() {
  const [history, setHistory] = useState<ApprovalHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApprovalHistory();
  }, []);

  async function loadApprovalHistory() {
    try {
      const { data, error } = await supabase
        .from("vendor_approval_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading approval history:", error);
        return;
      }

      setHistory(data || []);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p>Loading approval history...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Vendor Approval History</h2>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>History ID</th>
              <th>Vendor ID</th>
              <th>Approver ID</th>
              <th>Role</th>
              <th>Approval Level</th>
              <th>Action</th>
              <th>Comments</th>
              <th>Date & Time</th>
            </tr>
          </thead>

          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center" }}>
                  No approval history found
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.vendor_id}</td>
                  <td>{item.approver_id}</td>
                  <td>{item.approver_role}</td>
                  <td>Level {item.approval_level}</td>
                  <td>{item.action}</td>
                  <td>{item.comments || "-"}</td>
                  <td>
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}