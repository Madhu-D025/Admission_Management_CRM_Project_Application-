import React, { useState } from "react";

const initialLogs = [
  {
    id: 1,
    date: "10-Jan",
    time: "09:00 AM",
    type: "Material Sync",
    status: "Success",
    message: "145 items downloaded",
  },
];

const Dashboard = () => {
  const [logs, setLogs] = useState(initialLogs);

  const addLog = (type) => {
    const newId = Date.now();

    const newLog = {
      id: newId,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type,
      status: "Success",
      message: "Demo sync completed",
    };

    setLogs((prevLogs) => [newLog, ...prevLogs]);
  };

  return (
    <section className="content">
      <div className="card shadow-sm">
        <div
          className="card-header text-white"
          style={{ background: "#6a92c7ff" }}
        >
          <h3 className="card-title ml-2">Dashboard</h3>
        </div>
        <div className="card-body">
          <div className="mb-3 d-flex flex-wrap gap-2">
            <button
              className="btn btn-primary btn-sm mr-2"
              onClick={() => addLog("Material Sync")}
            >
              SYNC MATERIALS
            </button>
            <button
              className="btn btn-primary btn-sm mr-2"
              onClick={() => addLog("PO Sync")}
            >
              SYNC PO
            </button>
            <button
              className="btn btn-primary btn-sm mr-2"
              onClick={() => addLog("SO Sync")}
            >
              SYNC SO
            </button>
            <button
              className="btn btn-primary btn-sm mr-2"
              onClick={() => addLog("Push Stock")}
            >
              PUSH STOCK TO SAP
            </button>
          </div>

          <h6>Sync Logs</h6>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Sync Type</th>
                  <th>Status</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td>{l.date}</td>
                    <td>{l.time}</td>
                    <td>{l.type}</td>
                    <td>
                      <span className={`badge bg-success`}>{l.status}</span>
                    </td>
                    <td>{l.message}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center small text-muted">
                      No logs yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
