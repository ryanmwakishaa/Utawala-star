// Single source of truth for editable site content.
// App.jsx uses this as a fallback, then overlays anything saved from the
// admin dashboard (localStorage key "utawala-content").
// Admin.jsx uses this as the starting point for what appears in the dashboard.

export function deepMerge(base, overrides) {
  if (!overrides || typeof overrides !== 'object') return base;
  const result = { ...base };
  for (const key in overrides) {
    const overrideVal = overrides[key];
    const baseVal = base[key];
    if (
      overrideVal && typeof overrideVal === 'object' && !Array.isArray(overrideVal) &&
      baseVal && typeof baseVal === 'object' && !Array.isArray(baseVal)
    ) {
      result[key] = deepMerge(baseVal, overrideVal);
    } else {
      result[key] = overrideVal;
    }
  }
  return result;
}

export const defaultContent = {
  hero: {
    title: 'Utawala Star Sprints Club',
    subtitle: 'Unleash the champion within',
    logoOpacity: 0.4,
    tintOpacity: 0.5,
    logoScale: 1.6
  },
  welcome: {
    title: 'Welcome to Utawala Star Sprints Club',
    text: 'We are dedicated to developing world-class sprinters in the heart of Kenya. Our club provides professional coaching, state-of-the-art training programs, and a supportive community for athletes of all levels.'
  },
  features: [
    {
      icon: '🏃',
      title: 'Professional Coaching',
      description: 'Train with certified athletics coaches who have experience at national and international levels.'
    },
    {
      icon: '🏆',
      title: 'Competitive Excellence',
      description: 'Participate in local, regional, national and International competitions to showcase your talent.'
    },
    {
      icon: '👥',
      title: 'Community Spirit',
      description: 'Join a family of dedicated athletes who support and motivate each other.'
    }
  ],
  achievements: [
    'Several club members were part of the Kenyan national team at the 2025 World Athletics Championships in Tokyo and the World Relays.',
    'Athletes Meshack Babu, Clinton Aluvi and Dennis Mwai were specifically named to the 4x100m relay squads.',
    'Clinton Aluvi also won the coveted 100m gold medal in the African U-20 championship held in Nigeria 2025.',
    'Ronald koech saw success in the national police championship as well as East African police championship in both 100/200M',
    'Athletes such as Richard Ogutu, George Njenga, Eric Kimathi, Erastus mbaluka and Ronald Koech achieved major success in both the 4 * 100 and 4 * 400m relays in the East African police championship.',
    "National Record: Sprinter Meshack Babu, who was part of the men's 4x100m relay team in China, managed to set a new Kenyan national record of 38.35 seconds at the heats in China along his teammates.",
    'National and Military Titles: Meshack Babu won the men\'s 100m title at the 2024 Military Games in Abuja, Nigeria.',
    'National Recognition and Awards: Dan Kiviasi won the coveted "Tujiamini Gold" award, which included a cash prize of Ksh 500,000 to support his 2025 World Championships qualification efforts.',
    'Kelvin Jocktan also won the 400m of the Athletics Bingwa fest National competition finals',
    "Louis Khawel, a recent high school graduate, dominated the men's 100m at a national event (BingwaFest 2025 Nairobi edition winners 4 by 100 relays), clocking a personal best of 10.20s in the semifinals and winning the overall title.",
    'Jesse muigai, an upcoming athlete aged 15 years old, is bound to represent Kenya in the Africa youth Olympics in December of 2025',
    "Coaching Recognition: The athletes' strong performances led to both the club's Head coach and assistant coach, Perpetual Mbutu and Simon Riga, being selected as officials for the Kenyan team at the World Championships in tokyo Japan and the World Relays in Guangzhou China respectively."
  ],
  mission: 'Having recently partnered with USATF central California and Frenso flyers athletics club in California for exchange programmes and cultural exchanges, our ongoing mission is to identify, nurture, and develop sprinting talent from the grassroots to elite levels. To provide world-class sprint training that develops athletes physically, mentally, and socially, while promoting excellence, discipline, and sportsmanship.',
  vision: 'To be the premier sprint club in Kenya, producing national and international champions who inspire the next generation of athletes. We also envision a future where we can give back to the community through outreach programs, promoting athletics as a means of personal and social development.',
  coaches: [
    {
      name: 'Coach Perpetual Mbutu',
      title: 'Head Coach',
      bio: 'IAAF Certified Coach with over 10 years of coaching experience. Former administrative police champion and specialist in sprint training mechanics with experience from training camps in Europe. Part of the Coaching staff of the Kenyan team with recognition in the World Championships 2025 among other events. Part of the Coaching officials on mulitple accounts of the U-20 national team with experience from training camps all over the world inlcuding France among other accolades.'
    },
    {
      name: 'Coach Simon Riga',
      title: 'Assistant Coach',
      bio: "National coach of the relay team in Guangzhou, China 2025. He is known for his pivotal role and his significant contribution to Kenya's historic 4x100m relay success, helping them break a long drought to qualify for World Championships. Focuses on developing sprint talent, with his athletes achieving national recognition and international opportunities."
    }
  ],
  contact: {
    phone: '+254 706 449 949',
    altPhone: '+254 703 1460879',
    email: 'utawalastarsprintsclub@gmail.com'
  },
  gallery: {
    autoplay: true,
    intervalSeconds: 4
  }
};