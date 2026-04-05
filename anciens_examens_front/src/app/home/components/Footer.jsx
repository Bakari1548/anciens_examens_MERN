export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* À propos */}
          <div>
            <h3 className="mb-3 text-lg font-medium">À propos</h3>
            <p className="text-gray-400  ">
              Anciens Examens est une plateforme collaborative dédiée aux étudiants
              de l'Université Iba Der Thiam de Thiès.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="mb-3 text-lg font-medium">Liens rapides</h3>
            <ul className="space-y-2   text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Consulter les examens
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Partager un examen
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-lg font-medium">Contact</h3>
            <ul className="space-y-2   text-gray-400">
              <li>Université Iba Der Thiam</li>
              <li>Thiès, Sénégal</li>
              <li>
                <a href="mailto:contact@anciensexamens.sn" className="hover:text-white transition-colors">
                  contact@anciensexamens.sn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-6 text-center   text-gray-400">
          <p>
            &copy; 2026 Anciens Examens - Université Iba Der Thiam de Thiès. Tous droits réservés.
          </p>
        </div>
      </div>?
    </footer>
  );
}
