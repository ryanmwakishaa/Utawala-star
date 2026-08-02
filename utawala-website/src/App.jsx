import React, { useState, useRef, useEffect } from 'react';
import { defaultContent, deepMerge } from './siteContent';

// Automatically picks up every photo dropped into src/assets/gallery/ -
// any filename works, no renaming needed.
const galleryModules = import.meta.glob('/src/assets/gallery/*.{jpg,jpeg,JPG,JPEG,png,PNG,webp,WEBP}', { eager: true });
const galleryPaths = Object.keys(galleryModules).sort();
const GALLERY_PHOTOS = galleryPaths.map((path) => galleryModules[path].default);

// The About page photo: whichever gallery file has "whatsapp" in its name
// (case-insensitive), e.g. "WhatsApp Image 2025-07-30.jpeg".
const teamPhotoPath = galleryPaths.find((path) => path.toLowerCase().includes('whatsapp'));
const TEAM_PHOTO = teamPhotoPath ? galleryModules[teamPhotoPath].default : null;

// Coach headshots: prefers the exact filename typed in the admin dashboard;
// falls back to matching the coach's first name in a filename if left blank.
const coachModules = import.meta.glob('/src/assets/coaches/*.{jpg,jpeg,JPG,JPEG,png,PNG,webp,WEBP}', { eager: true });
const coachPaths = Object.keys(coachModules);
function findCoachPhoto(coach) {
  if (coach.photo) {
    const exact = coachPaths.find((path) => path.toLowerCase().endsWith('/' + coach.photo.toLowerCase()));
    if (exact) return coachModules[exact].default;
  }
  const firstName = coach.name.replace(/^coach\s+/i, '').split(' ')[0].toLowerCase();
  const match = coachPaths.find((path) => path.toLowerCase().includes(firstName));
  return match ? coachModules[match].default : null;
}
function getInitials(coachName) {
  const cleaned = coachName.replace(/^coach\s+/i, '');
  return cleaned
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

// Paste your Google Apps Script Web App URL here once deployed
// (Extensions > Apps Script > Deploy > Web app, in the Google Sheet).
const GOOGLE_SHEET_URL = 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

export default function App() {
  const [page, setPage] = useState('home');
  const [ctaExpanded, setCtaExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState({ visible: false, ok: true, text: '' });
  const [data, setData] = useState(defaultContent);
  const galleryPhotos = GALLERY_PHOTOS;
  const [displayedSlide, setDisplayedSlide] = useState(0);
  const [incomingSlide, setIncomingSlide] = useState(null);
  const [slideDirection, setSlideDirection] = useState('right');
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isOtherEvent, setIsOtherEvent] = useState(false);
  const formRef = useRef(null);
  const transitionTimeout = useRef(null);

  const openLightbox = () => setLightboxOpen(true);
  const closeLightbox = () => setLightboxOpen(false);

  const goToSlide = (nextIndex, dir) => {
    if (incomingSlide !== null || galleryPhotos.length <= 1) return;
    setSlideDirection(dir);
    setIncomingSlide(nextIndex);
    clearTimeout(transitionTimeout.current);
    transitionTimeout.current = setTimeout(() => {
      setDisplayedSlide(nextIndex);
      setIncomingSlide(null);
    }, 700);
  };
  const showNext = () => goToSlide((displayedSlide + 1) % galleryPhotos.length, 'right');
  const showPrev = () => goToSlide((displayedSlide - 1 + galleryPhotos.length) % galleryPhotos.length, 'left');
  const goToSlideIndex = (i) => goToSlide(i, i > displayedSlide ? 'right' : 'left');

  useEffect(() => () => clearTimeout(transitionTimeout.current), []);

  // Load whatever's been saved from the admin dashboard, layered on top of the defaults
  useEffect(() => {
    try {
      const saved = localStorage.getItem('utawala-content');
      if (saved) {
        setData((prev) => deepMerge(prev, JSON.parse(saved)));
      }
    } catch (e) {
      // no saved settings yet, defaults apply
    }
  }, []);

  const autoplayEnabled = data.gallery.autoplay;
  const autoplayInterval = (data.gallery.intervalSeconds || 4) * 1000;

  // Auto-advance the carousel (pauses on hover, and can be switched off from the admin dashboard)
  useEffect(() => {
    if (!autoplayEnabled || carouselPaused || galleryPhotos.length <= 1) return;
    const id = setInterval(() => {
      showNext();
    }, autoplayInterval);
    return () => clearInterval(id);
  }, [autoplayEnabled, carouselPaused, galleryPhotos.length, autoplayInterval, displayedSlide]);

  // Hidden shortcut: hold Shift and type "admin" to jump to the admin login
  useEffect(() => {
    let buffer = '';
    const handleKeyDown = (e) => {
      if (e.shiftKey && /^[a-zA-Z]$/.test(e.key)) {
        buffer = (buffer + e.key.toLowerCase()).slice(-5);
        if (buffer === 'admin') {
          window.location.hash = 'admin';
          buffer = '';
        }
      } else if (!e.shiftKey) {
        buffer = '';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showPage = (pageId) => {
    setPage(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCta = () => setCtaExpanded((v) => !v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      age: formData.get('age'),
      gender: formData.get('gender'),
      event: formData.get('event') === 'Other' ? formData.get('customEvent') : formData.get('event'),
      timestamp: new Date().toLocaleString(),
    };
    // Make sure the resolved event value (not just "Other") is what gets sent
    formData.set('event', data.event);

    try {
      const response = await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setFormStatus({ visible: true, ok: true, text: 'Thank you for your enquiry! We will get back to you soon.' });
        form.reset();
        setIsOtherEvent(false);
      } else {
        setFormStatus({ visible: true, ok: false, text: 'Oops! There was a problem submitting your form. Please try again.' });
      }
      setTimeout(() => setFormStatus((s) => ({ ...s, visible: false })), 5000);
    } catch (error) {
      const subject = encodeURIComponent(`Booking Enquiry - ${data.event}`);
      const body = encodeURIComponent(
        `Name: ${data.name}\nPhone: ${data.phone}\nAge: ${data.age}\nGender: ${data.gender}\nEvent: ${data.event}`
      );
      window.location.href = `mailto:utawalastarsprintsclub@gmail.com?subject=${subject}&body=${body}`;
    }
  };

  return (
    <>
      <header>
        <nav>
          <div className="logo">
            <img src="/logo.png" alt="Utawala Star Sprints Club Logo" className="logo-img" />
            <span>Utawala Star Sprints Club</span>
          </div>
          <ul id="navMenu" className={mobileMenuOpen ? 'open' : ''}>
            <li><a href="#" onClick={(e) => { e.preventDefault(); showPage('home'); }}>Home</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); showPage('about'); }}>About Us</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); showPage('coaches'); }}>Coaches</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); showPage('contact'); }}>Bookings</a></li>
          </ul>
          <button
            className={`menu-toggle${mobileMenuOpen ? ' open' : ''}`}
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
      </header>

      <div className={`cta-container${ctaExpanded ? ' expanded' : ''}`} id="ctaContainer">
        <div className="cta-options">
          <a href="https://wa.me/254706449949" target="_blank" rel="noopener noreferrer" className="cta-pill">
            <span className="cta-icon bg-whatsapp">
              <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.001 2C6.478 2 2 6.477 2 12c0 1.892.526 3.66 1.438 5.168L2 22l4.963-1.393A9.943 9.943 0 0012 22c5.523 0 10-4.477 10-10S17.524 2 12.001 2zm0 18.062a8.02 8.02 0 01-4.318-1.255l-.31-.19-3.19.895.87-3.11-.202-.32A8.028 8.028 0 0112 3.938c4.44 0 8.062 3.622 8.062 8.062 0 4.44-3.622 8.062-8.061 8.062z"/></svg>
            </span>
            WhatsApp Us
          </a>
          <a href="tel:+254706449949" className="cta-pill">
            <span className="cta-icon bg-call">
              <svg viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.56.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.56 1 1 0 01-.25 1.01l-2.2 2.22z"/></svg>
            </span>
            Call Us
          </a>
        </div>
        <button className="cta-main" onClick={toggleCta} aria-label="Call or WhatsApp us">
          <span className="cta-main-icon">
            <svg className="cta-open-icon" viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 004.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0012.04 2zm5.83 14.19c-.24.68-1.4 1.3-1.94 1.35-.5.05-1 .25-3.37-.7-2.85-1.14-4.68-4.06-4.82-4.25-.14-.19-1.16-1.55-1.16-2.96 0-1.4.74-2.09 1-2.38.27-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.42-.07.65.5.24.58.81 2 .88 2.14.07.15.12.32.02.51-.1.19-.15.3-.29.47-.15.16-.31.36-.44.49-.15.14-.3.3-.13.58.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.44.29.15.46.13.63-.05.17-.19.72-.83.91-1.12.19-.29.38-.24.65-.14.27.1 1.71.81 2 .96.29.15.48.22.55.34.07.13.07.71-.17 1.39z"/></svg>
            <svg className="cta-close-icon" viewBox="0 0 24 24"><path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7A1 1 0 105.7 7.11L10.59 12 5.7 16.89a1 1 0 101.41 1.41L12 13.41l4.89 4.89a1 1 0 001.41-1.41L13.41 12l4.89-4.89a1 1 0 000-1.4z"/></svg>
          </span>
          Call / WhatsApp
        </button>
      </div>

      <div
        className={`hero${page !== 'home' ? ' hidden' : ''}`}
        id="heroSection"
        style={{
          '--hero-logo-opacity': data.hero.logoOpacity,
          '--hero-tint-opacity': data.hero.tintOpacity,
          '--hero-logo-scale': data.hero.logoScale,
        }}
      >
        <div className="hero-content">
          <h1>{data.hero.title}</h1>
          <p>{data.hero.subtitle}</p>
        </div>
      </div>

      <div className="container">
        {/* HOME PAGE */}
        <div id="home" className={`page-content${page === 'home' ? ' active' : ''}`}>
          <h2>{data.welcome.title}</h2>
          <p>{data.welcome.text}</p>

          <div className="card-grid">
            {data.features.map((feature, i) => (
              <div className="card" key={i}>
                <h3>{feature.icon} {feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>

          <h3>Major Achievements</h3>
          <ul>
            {data.achievements.map((achievement, i) => (
              <li key={i}>{achievement}</li>
            ))}
          </ul>

          <h3>Club Gallery</h3>
          <div
            className="gallery-carousel"
            onMouseEnter={() => setCarouselPaused(true)}
            onMouseLeave={() => setCarouselPaused(false)}
          >
            {galleryPhotos.length > 0 ? (
              <>
                {galleryPhotos.length > 1 && (
                  <img
                    src={galleryPhotos[(displayedSlide - 1 + galleryPhotos.length) % galleryPhotos.length]}
                    alt="Previous"
                    className="carousel-thumb"
                    onClick={showPrev}
                  />
                )}

                <div className="carousel-main-wrap" onClick={openLightbox}>
                  <img
                    src={galleryPhotos[displayedSlide]}
                    alt={`Utawala Star Sprints Club ${displayedSlide + 1}`}
                    className="carousel-main-base"
                  />
                  {incomingSlide !== null && (
                    <img
                      key={incomingSlide}
                      src={galleryPhotos[incomingSlide]}
                      alt={`Utawala Star Sprints Club ${incomingSlide + 1}`}
                      className={`carousel-main-incoming ${slideDirection === 'right' ? 'cover-in-right' : 'cover-in-left'}`}
                    />
                  )}
                </div>

                {galleryPhotos.length > 1 && (
                  <img
                    src={galleryPhotos[(displayedSlide + 1) % galleryPhotos.length]}
                    alt="Next"
                    className="carousel-thumb"
                    onClick={showNext}
                  />
                )}

                {galleryPhotos.length > 1 && (
                  <>
                    <button className="carousel-arrow carousel-arrow-prev" onClick={showPrev} aria-label="Previous photo">&#8249;</button>
                    <button className="carousel-arrow carousel-arrow-next" onClick={showNext} aria-label="Next photo">&#8250;</button>
                    <div className="carousel-dots">
                      {galleryPhotos.map((_, i) => (
                        <button
                          key={i}
                          className={`carousel-dot${i === displayedSlide ? ' active' : ''}`}
                          onClick={() => goToSlideIndex(i)}
                          aria-label={`Go to photo ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="gallery-placeholder">Photo coming soon</div>
            )}
          </div>
        </div>

        {/* ABOUT US PAGE */}
        <div id="about" className={`page-content${page === 'about' ? ' active' : ''}`}>
          <h2>About Utawala Star Sprints Club</h2>

          <div className="team-photo-container">
            {TEAM_PHOTO ? (
              <img src={TEAM_PHOTO} alt="Utawala Star Sprints Club Team" className="team-photo" />
            ) : (
              <div className="gallery-placeholder">Team photo coming soon</div>
            )}
            <p className="photo-caption">Our dedicated team of athletes and coaches</p>
          </div>

          <p>Founded in 2018, Utawala Stars Sprints Club has emerged as a powerhouse in Kenyan sprinting, nurturing both budding and professional sprinters. The Club has grown to become one of the leading athletics clubs in Nairobi. The club currently boasts 35 athletes, including top-tier names such as: Kenya Prisons 100m champion Dan Kiviasi, national 100m champion Meshack Babu, African U-20 100m Champion Clinton Aluvi, African decathlon silver medallist Edwin Too and 2015 African 100m champion Eunice Kadogo. At the heart of this initiative is coach Perpetual Mbutu, a former elite athlete whose passion for athletics drove her to establish the club. Emerging Talents like Dennis Mwai and Clinton Aluvi who have proven to be exceptionally talented athletes, managed to get sponsorship by Africa's fastest man, Ferdinand Omanyala. They earned invitations to the national World Relay trials after spectacular performances at the National Championships, with Aluvi finishing fourth in the men's 100m final in his debut.</p>

          <div className="read-more">
            <a href="https://www.the-star.co.ke/sports/2025-04-04-coach-perpetual-and-utawala-sprints-club-are-powering-kenyas-next-speed-stars" target="_blank" rel="noopener noreferrer">More info...</a>
          </div>

          <h3>Our Mission</h3>
          <p>{data.mission}</p>

          <h3>Our Vision</h3>
          <p>{data.vision}</p>

          <h3>Core Values</h3>
          <div className="card-grid">
            <div className="card">
              <h3>Excellence</h3>
              <p>We strive for the highest standards in training and competition.</p>
            </div>
            <div className="card">
              <h3>Discipline</h3>
              <p>We instill dedication, consistency, and commitment in all our athletes.</p>
            </div>
            <div className="card">
              <h3>Integrity</h3>
              <p>We promote fair play, honesty, and respect in all activities. We have done this by strictly adhering to the World Athletics anti-doping measures.</p>
            </div>
          </div>

          <h3>Community Outreach &amp; Charity Work</h3>
          <p>Utawala Star Sprints Club is committed not only to athletic excellence but also to uplifting the community. Over the years, the club has organized and participated in various charitable initiatives, including:</p>

          <ul>
            <li>Donating training equipment and sports kits to underprivileged youth athletes.</li>
            <li>Recruiting street kids to sharp and well equiped sports people.</li>
            <li>Collaborating with local organizations to support children's homes through visits and donations.</li>
            <li>Supporting the less fortunate by organising fundraisers for their wellbeing.</li>
          </ul>

          <p>These initiatives reflect our commitment to giving back and using athletics as a force for positive change.</p>
        </div>

        {/* COACHES PAGE */}
        <div id="coaches" className={`page-content${page === 'coaches' ? ' active' : ''}`}>
          <h2>Our Coaching Team</h2>

          <div className="card-grid">
            {data.coaches.map((coach, i) => {
              const photo = findCoachPhoto(coach);
              return (
                <div className="card" key={i}>
                  {photo ? (
                    <img key={photo} src={photo} alt={coach.name} className="coach-photo" />
                  ) : (
                    <div className="coach-photo coach-avatar-fallback">{getInitials(coach.name)}</div>
                  )}
                  <h3>{coach.name}</h3>
                  <p><strong>{coach.title}</strong></p>
                  <p>{coach.bio}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOOKINGS PAGE */}
        <div id="contact" className={`page-content${page === 'contact' ? ' active' : ''}`}>
          <h2>Bookings</h2>

          <div className="form-container">
            <form id="contactForm" ref={formRef} action={GOOGLE_SHEET_URL} method="POST" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactName">👤 Full Name *</label>
                  <input type="text" id="contactName" name="name" required />
                </div>

                <div className="form-group">
                  <label htmlFor="contactNumber">📱 Phone Number *</label>
                  <input type="tel" id="contactNumber" name="phone" placeholder="e.g. 0712 345 678" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactAge">🎂 Age *</label>
                  <input type="number" id="contactAge" name="age" min="4" max="99" required />
                </div>

                <div className="form-group">
                  <label htmlFor="contactGender">Gender *</label>
                  <select id="contactGender" name="gender" defaultValue="" required>
                    <option value="" disabled>Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="event">🏅 Event / Program of Interest *</label>
                <select
                  id="event"
                  name="event"
                  defaultValue=""
                  required
                  onChange={(e) => setIsOtherEvent(e.target.value === 'Other')}
                >
                  <option value="" disabled>Select an event</option>
                  <option value="100m Sprint">100m Sprint</option>
                  <option value="200m Sprint">200m Sprint</option>
                  <option value="400m Sprint">400m Sprint</option>
                  <option value="4x100m Relay">4x100m Relay</option>
                  <option value="4x400m Relay">4x400m Relay</option>
                  <option value="General Training / Trial">General Training / Trial</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {isOtherEvent && (
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label htmlFor="customEvent">✍️ Please specify your event *</label>
                  <input type="text" id="customEvent" name="customEvent" placeholder="Type your event here..." required />
                </div>
              )}

              <button type="submit" className="btn">🚀 Submit Enquiry</button>
            </form>

            {formStatus.visible && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  borderRadius: '5px',
                  display: 'block',
                  background: formStatus.ok ? '#d4edda' : '#f8d7da',
                  color: formStatus.ok ? '#155724' : '#721c24',
                }}
              >
                {formStatus.text}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <h4>Utawala Star Sprints Club</h4>
            <p>Developing world-class sprinters in the heart of Kenya since 2018 — professional coaching, competitive excellence, and community spirit.</p>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); showPage('home'); }}>Home</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); showPage('about'); }}>About Us</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); showPage('coaches'); }}>Coaches</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); showPage('contact'); }}>Bookings</a></li>
            </ul>
          </div>

          <div className="footer-social">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="https://web.facebook.com/thestarsprintsclubke/?_rdc=1&_rdr#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg viewBox="0 0 24 24"><path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0022 12z"/></svg>
              </a>
              <a href="https://www.instagram.com/utawala_star_sprints_club/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 01-1.38-.9 3.72 3.72 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2zm0-2.2C8.74 0 8.33.01 7.05.07c-1.28.06-2.15.26-2.91.56-.79.31-1.46.72-2.13 1.38A5.87 5.87 0 00.63 3.14c-.3.76-.5 1.63-.56 2.91C0 7.33 0 7.74 0 11s.01 3.67.07 4.95c.06 1.28.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13a5.87 5.87 0 002.13 1.38c.76.3 1.63.5 2.91.56C8.33 22.99 8.74 23 12 23s3.67-.01 4.95-.07c1.28-.06 2.15-.26 2.91-.56a5.87 5.87 0 002.13-1.38 5.87 5.87 0 001.38-2.13c.3-.76.5-1.63.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91a5.87 5.87 0 00-1.38-2.13A5.87 5.87 0 0019.86.63c-.76-.3-1.63-.5-2.91-.56C15.67.01 15.26 0 12 0z"/><path d="M12 5.6A6.4 6.4 0 1012 18.4 6.4 6.4 0 0012 5.6zm0 10.56A4.16 4.16 0 1112 7.84a4.16 4.16 0 010 8.32zM18.8 5.36a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/></svg>
              </a>
              <a href="https://www.youtube.com/@utawalastarsprintsclub" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <svg viewBox="0 0 24 24"><path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 00.5 6.19 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.81zM9.6 15.6V8.4l6.4 3.6-6.4 3.6z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@utawalastarsprintsclub?_r=1&_t=ZM-921fv3nvFHs" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <svg viewBox="0 0 24 24"><path d="M16.6 5.82a4.28 4.28 0 01-3.02-3.02h-2.95v12.53a2.7 2.7 0 11-1.91-2.58V9.71a5.7 5.7 0 105.7 5.7V9.14a7.2 7.2 0 004.18 1.33V7.5a4.28 4.28 0 01-2-1.68z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2018 Utawala Star Sprints Club. All rights reserved.</p>
        </div>
      </footer>

      {lightboxOpen && galleryPhotos.length > 0 && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">&times;</button>
          {galleryPhotos.length > 1 && (
            <button
              className="lightbox-prev"
              onClick={(e) => { e.stopPropagation(); showPrev(); }}
              aria-label="Previous photo"
            >
              &#8249;
            </button>
          )}
          <img src={galleryPhotos[displayedSlide]} alt="Utawala Star Sprints Club" className="lightbox-image" onClick={(e) => e.stopPropagation()} />
          {galleryPhotos.length > 1 && (
            <button
              className="lightbox-next"
              onClick={(e) => { e.stopPropagation(); showNext(); }}
              aria-label="Next photo"
            >
              &#8250;
            </button>
          )}
        </div>
      )}
    </>
  );
}