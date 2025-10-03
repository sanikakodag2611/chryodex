import React from 'react';

const ContextualTable = () => {
  return (
    <div>
      <h2>Contextual Table</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr className="table-success">
            <td>1</td>
            <td>Active User</td>
            <td>Success</td>
          </tr>
          <tr className="table-warning">
            <td>2</td>
            <td>Pending</td>
            <td>Warning</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ContextualTable;