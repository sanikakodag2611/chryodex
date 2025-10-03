import React, { useState } from "react";
import { Form, Button, Row, Col, Alert } from "react-bootstrap";
import axios from "axios";
import MainCard from "components/MainCard";
import { v4 as uuidv4 } from "uuid";

// Helper: Convert Excel serial date (number) to JS Date
function excelDateToJSDate(serial) {
  if (typeof serial !== "number") return null;
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400 * 1000;
  const date_info = new Date(utc_value);
  return date_info;
}

function AddFile() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("sales"); // default selection
  const [message, setMessage] = useState("");
  const [skippedRows, setSkippedRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [activeEdit, setActiveEdit] = useState({ rowId: null, key: null });

  const keyMap = {
    no: ["no", "invoice_no", "invoice no", "invoiceno", "invoice_number"],
    date: ["date", "invoice_date", "invoice date", "dateofinvoice"],
    customer: ["customer", "customer_name", "client", "client_name"],
    salesman: ["salesman", "sales_person", "sales person", "salesman_name"],
    bill_amount: ["bill_amount", "bill amount", "amount", "billamount", "total_amount"],
    city: ["city", "location", "town"],
    item: ["item", "product", "description", "product_description"],
    qty: ["qty", "quantity", "qtyordered"],
    rate: ["rate", "price", "unit_price"],
    destination: ["destination", "dest", "ship_to"],
    tax_amount: ["tax_amount", "tax amount", "tax", "taxamt"],
  };

  const displayedColumns = Object.keys(keyMap);

  const columnLabels = {
    no: "Invoice No",
    date: "Date",
    customer: "Customer",
    salesman: "Salesman",
    bill_amount: "Bill Amount",
    city: "City",
    item: "Item",
    qty: "Qty",
    rate: "Rate",
    destination: "Destination",
    tax_amount: "Tax Amount",
  };

  // Normalize keys of incoming row
  const normalizeRowKeys = (row) => {
    const lowerCaseRow = {};
    Object.keys(row).forEach((k) => {
      lowerCaseRow[k.toLowerCase().replace(/\s|_/g, "")] = row[k];
    });

    const normalized = {};
    for (const [standardKey, aliases] of Object.entries(keyMap)) {
      normalized[standardKey] = "";
      for (const alias of aliases) {
        const normAlias = alias.replace(/\s|_/g, "");
        if (lowerCaseRow.hasOwnProperty(normAlias)) {
          normalized[standardKey] = lowerCaseRow[normAlias];
          break;
        }
      }
    }
    return normalized;
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setSkippedRows([]);
    setSelectedRows([]);
    setActiveEdit({ rowId: null, key: null });
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an Excel file!");
      return;
    }
    setUploadLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Pick API based on radio selection
      const endpoint =
        fileType === "sales"
          ? "http://localhost:8000/api/upload-invoice"
          : "http://localhost:8000/api/upload-credit-note";

      const res = await axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data.message || "Upload completed");

      const skipped = Array.isArray(res.data.skipped)
        ? res.data.skipped.map((row) => {
            const normalized = normalizeRowKeys(row);
            // Convert Excel date if numeric
            let dateValue = normalized.date;
            if (typeof dateValue === "number") {
              const jsDate = excelDateToJSDate(dateValue);
              normalized.date = jsDate ? jsDate.toISOString().split("T")[0] : dateValue;
            }
            return { ...normalized, rowId: uuidv4() };
          })
        : [];

      setSkippedRows(skipped);
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Upload failed: " + err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const toggleSelection = (rowId) => {
    setSelectedRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId]
    );
  };

  const toggleSelectAll = (checked) => {
    const allIds = skippedRows.map((row) => row.rowId);
    setSelectedRows(checked ? allIds : []);
  };

  const handleEditCell = (rowId, key, value) => {
    setSkippedRows((prev) =>
      prev.map((row) => (row.rowId === rowId ? { ...row, [key]: value } : row))
    );
  };

  const focusCell = (rowId, key) => {
    setActiveEdit({ rowId, key });
  };

  const exitEditMode = () => {
    setActiveEdit({ rowId: null, key: null });
  };

  const validateBeforeUpdate = (rows) => {
    for (const row of rows) {
      for (const key of Object.keys(row)) {
        const val = row[key];
        if (key.toLowerCase().includes("date") && val && isNaN(Date.parse(val))) {
          alert(`Invoice No ${row.no || "N/A"}: Invalid date format in "${key}"`);
          return false;
        }
        if (key.toLowerCase().includes("amount") && val && isNaN(Number(val))) {
          alert(`Invoice No ${row.no || "N/A"}: "${key}" must be numeric`);
          return false;
        }
        if (key.toLowerCase() === "qty" && val && isNaN(Number(val))) {
          alert(`Invoice No ${row.no || "N/A"}: "qty" must be numeric`);
          return false;
        }
      }
    }
    return true;
  };

  const updateSelected = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one row to update.");
      return;
    }
    setUpdateLoading(true);

    const rowsToUpdate = skippedRows.filter((row) => selectedRows.includes(row.rowId));

    const rowsToSend = rowsToUpdate.map((row) => ({
      ...row,
      originalNo: row.no,
    }));

    if (!validateBeforeUpdate(rowsToSend)) {
      setUpdateLoading(false);
      return;
    }

    try {
      const endpoint =
        fileType === "sales"
          ? "http://localhost:8000/api/invoices/update-duplicates"
          : "http://localhost:8000/api/credit-notes/update-duplicates";

      const response = await axios.post(endpoint, {
        rows: rowsToSend,
      });

      setMessage(response.data.message || "Selected records updated successfully!");
      setSkippedRows((prev) => prev.filter((row) => !selectedRows.includes(row.rowId)));
      setSelectedRows([]);
      exitEditMode();
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message || err);
      alert("Failed to update records. Please check console for details.");
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <MainCard title="Upload Excel File">
      <Row>
        <Col>
          {/* Radio selection */}
          <Form className="mb-3">
            <Form.Check
              inline
              label="Sales File"
              type="radio"
              id="sales-radio"
              name="fileType"
              value="sales"
              checked={fileType === "sales"}
              onChange={(e) => setFileType(e.target.value)}
            />
            <Form.Check
              inline
              label="Credit Note File"
              type="radio"
              id="credit-radio"
              name="fileType"
              value="credit"
              checked={fileType === "credit"}
              onChange={(e) => setFileType(e.target.value)}
            />
          </Form>

          <Form>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Control
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                disabled={uploadLoading || updateLoading}
              />
            </Form.Group>
            <Button
              onClick={handleUpload}
              disabled={!file || uploadLoading || updateLoading}
              variant="primary"
              className="mb-3"
            >
              {uploadLoading ? "Uploading..." : "Upload"}
            </Button>
          </Form>

          {message && <Alert variant="info">{message}</Alert>}

          {skippedRows.length > 0 && (
            <>
              <h3 className="mt-4">Skipped Rows (Incoming Duplicates)</h3>
              <Button
                onClick={updateSelected}
                disabled={selectedRows.length === 0 || updateLoading}
                variant={selectedRows.length === 0 ? "secondary" : "success"}
                className="mb-3"
              >
                {updateLoading ? "Updating..." : `Update Selected (${selectedRows.length})`}
              </Button>

              <div style={{ overflowX: "auto" }}>
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>
                        <Form.Check
                          type="checkbox"
                          checked={
                            selectedRows.length === skippedRows.length && skippedRows.length > 0
                          }
                          onChange={(e) => toggleSelectAll(e.target.checked)}
                        />
                      </th>
                      {displayedColumns.map((col) => (
                        <th key={col}>
                          {columnLabels[col] || col.replace(/_/g, " ").toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {skippedRows.map((row) => (
                      <tr key={row.rowId}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedRows.includes(row.rowId)}
                            onChange={() => !updateLoading && toggleSelection(row.rowId)}
                            disabled={updateLoading}
                          />
                        </td>
                        {displayedColumns.map((key) => {
                          const editing =
                            activeEdit.rowId === row.rowId &&
                            activeEdit.key === key &&
                            selectedRows.includes(row.rowId) &&
                            !updateLoading;

                          const isEditable = key !== "no";
                          const displayValue = row[key] ?? "N/A";

                          return (
                            <td
                              key={key}
                              onClick={() => {
                                if (
                                  selectedRows.includes(row.rowId) &&
                                  !updateLoading &&
                                  isEditable
                                ) {
                                  focusCell(row.rowId, key);
                                }
                              }}
                              style={{
                                cursor:
                                  selectedRows.includes(row.rowId) && !updateLoading && isEditable
                                    ? "pointer"
                                    : "default",
                              }}
                            >
                              {editing && isEditable ? (
                                <Form.Control
                                  autoFocus
                                  value={displayValue}
                                  onChange={(e) => handleEditCell(row.rowId, key, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === "Escape") {
                                      e.preventDefault();
                                      exitEditMode();
                                    }
                                  }}
                                />
                              ) : (
                                displayValue
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Col>
      </Row>
    </MainCard>
  );
}

export default AddFile;
