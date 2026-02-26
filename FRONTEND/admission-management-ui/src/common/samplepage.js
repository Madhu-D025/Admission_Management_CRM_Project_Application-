import React from "react";

const Sample = () => {
  return (
    <section className="content">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title text-sm">Sample Page</h3>
          <div className="card-tools">
            <button className="btn-custom custom-primary-button">Sample Button</button>
          </div>
        </div>
        <div className="card-body text-sm">
          <div className="row">
            <div className="col-md-12">
              <div className="form-group">
                <label htmlFor="sampleInput">Sample Field</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="sampleInput"
                  placeholder="Enter sample text"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer mt-2">
          <button type="button" className="custom-btn custom-primary-button mr-2">
            Submit
          </button>
          <button type="button" className="custom-btn custom-secondary-button mr-2">
            Clear
          </button>
        </div>
      </div>
    </section>
  );
};

export default Sample;