import './Footer.scss';

export default function Footer() {
    return (
        <footer id="footer" className="absolute bottom-0 left-0 right-0 text-white text-center">
        <div className="footerContainer flex row justify-between p-8">
            <div className="left">
                A <a href="https://www.instagram.com/horchatacluuub/" target="_blank" alt="Horchata Club on Instagram" rel="noopener noreferrer">Horchata Club</a> joint
            </div>
            <div className="right">
                Built in the year 2025.
            </div>            
        </div>
        </footer>
    );
}