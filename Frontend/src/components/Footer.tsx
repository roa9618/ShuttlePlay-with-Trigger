import { useState } from 'react';
import FooterModal from './FooterModal';
import { footerDocuments, footerMenuItems, type FooterDocumentKey } from '../utils/footerContent';
import { styles } from './Footer.styles';

export default function Footer() {
  const [selectedDocument, setSelectedDocument] = useState<FooterDocumentKey | null>(null);

  return (
    <>
      <footer className = {styles.footer}>
        <div className = {styles.inner}>
          <nav className = {styles.links} aria-label = "푸터 메뉴">
            {footerMenuItems.map(item => (
              <button
                key = {item.key}
                type = "button"
                className = {styles.link}
                onClick = {() => setSelectedDocument(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <p className = {styles.copyright}>© 2026 셔틀플레이. All rights reserved.</p>
        </div>
      </footer>

      <FooterModal
        documentKey = {selectedDocument}
        document = {selectedDocument ? footerDocuments[selectedDocument] : null}
        onClose = {() => setSelectedDocument(null)}
      />
    </>
  );
}
