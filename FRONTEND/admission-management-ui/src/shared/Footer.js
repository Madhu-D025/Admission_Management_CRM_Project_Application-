const config = require('../services/config.json');
 function Footer() {
    return (
        <>
            <footer className="main-footer ">
                <strong> &copy; 2025-2026 <a  target="_blank" className='footer-link' rel="noopener noreferrer" href="https://www.linkedin.com/in/madhudlinkdin">{config.PoweredBy}</a>.</strong>
                All rights reserved.
                <div className="float-right d-none d-sm-inline-block">
                    <b>Version</b> {config.version}
                </div>
            </footer>
        </>
    );
}

export default Footer;