export type BlogStatus = 'pending' | 'published';

export type Screen =
  | 'dashboard'
  | 'clients'
  | 'websites'
  | 'blogs'
  | 'view-blog'
  | 'edit-blog'
  | 'profile'
  | 'settings';

export interface Blog {
  id: string;
  title: string;
  author: string;
  authorEmail: string;
  status: BlogStatus;
  date: string;
  category: string;
  tags: string[];
  content: string;
  image: string;
  excerpt: string;
}

export const CATEGORIES = [
  'Technology',
  'Travel',
  'Food',
  'Health',
  'Business',
  'Lifestyle',
  'Design',
  'Writing',
];

export const mockBlogs: Blog[] = [
  {
    id: '1',
    title: '10 Tips for Better Writing in 2024',
    author: 'Sarah Johnson',
    authorEmail: 'sarah@example.com',
    status: 'published',
    date: '2024-06-15',
    category: 'Writing',
    tags: ['tips', 'writing', 'productivity'],
    content:
      'Good writing is a skill that can be developed with practice and the right guidance. In this article, we explore ten proven techniques that professional writers use to craft compelling content.\n\n## 1. Know Your Audience\nUnderstanding who you\'re writing for is the foundation of effective communication. Before you begin, ask yourself: Who is my reader? What do they already know? What do they need to learn?\n\n## 2. Create an Outline\nA solid outline prevents writer\'s block and keeps your content focused. Spend 10–15 minutes planning your structure before you start writing.\n\n## 3. Write First, Edit Later\nMany writers get stuck trying to perfect each sentence as they go. Instead, let your ideas flow freely in the first draft, then refine them in the editing phase.\n\n## 4. Use Active Voice\nActive voice makes your writing more direct and engaging. Compare "The report was written by John" (passive) vs "John wrote the report" (active).\n\n## 5. Keep Sentences Short\nAim for an average sentence length of 15–20 words. Short sentences are easier to read and understand, especially on screens.',
    image:
      'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800',
    excerpt:
      'Discover the top techniques professional writers use to craft compelling content and improve your writing skills.',
  },
  {
    id: '2',
    title: 'Remote Work Productivity: A Complete Guide',
    author: 'Michael Chen',
    authorEmail: 'michael@example.com',
    status: 'pending',
    date: '2024-06-18',
    category: 'Technology',
    tags: ['remote work', 'productivity', 'home office'],
    content:
      'The shift to remote work has transformed how we approach productivity. Whether you\'re a seasoned remote worker or new to the game, these strategies will help you maximize your efficiency from home.\n\n## Setting Up Your Workspace\nYour environment directly impacts your productivity. Invest in a good chair, proper lighting, and a dedicated workspace separate from your relaxation areas.\n\n## Time Blocking\nInstead of working reactively, schedule specific blocks of time for focused work, meetings, and breaks. Tools like Google Calendar can help you visualize and protect your time.\n\n## Digital Communication Best Practices\nOver-communicate in writing. In a remote setting, you lose the informal conversations that happen in offices, so be proactive about sharing updates and progress.',
    image:
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800',
    excerpt:
      'Master the art of working from home with these proven productivity strategies used by successful remote workers worldwide.',
  },
  {
    id: '3',
    title: 'Exploring the Hidden Gems of Southeast Asia',
    author: 'Emma Rodriguez',
    authorEmail: 'emma@example.com',
    status: 'published',
    date: '2024-06-10',
    category: 'Travel',
    tags: ['travel', 'asia', 'adventure', 'backpacking'],
    content:
      'Southeast Asia continues to enchant travelers with its incredible diversity of landscapes, cultures, and cuisines. Beyond the tourist trail, there are incredible destinations waiting to be discovered.\n\n## Vietnam\'s Central Highlands\nWhile Hanoi and Ho Chi Minh City attract millions of tourists, the Central Highlands remain relatively unexplored. Cities like Da Lat and Kon Tum offer cool mountain air, coffee plantations, and indigenous culture.\n\n## Myanmar\'s Inle Lake Region\nThe floating villages and markets of Inle Lake are unlike anything else in the world. Local fishermen with their distinctive leg-rowing technique are an iconic sight.\n\n## Cambodia\'s Cardamom Mountains\nForget Angkor Wat for a moment — the Cardamom Mountains are home to some of Southeast Asia\'s most pristine rainforests, waterfalls, and wildlife.',
    image:
      'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800',
    excerpt:
      'Go beyond the tourist trail and discover the hidden gems of Southeast Asia that most travelers never get to see.',
  },
  {
    id: '4',
    title: 'The Science of Healthy Meal Prep',
    author: 'Dr. Lisa Park',
    authorEmail: 'lisa@example.com',
    status: 'pending',
    date: '2024-06-20',
    category: 'Food',
    tags: ['nutrition', 'meal prep', 'health', 'cooking'],
    content:
      'Meal prepping isn\'t just a fitness trend — it\'s a scientifically-backed approach to maintaining a healthy diet while saving time and money.\n\n## Why Meal Prep Works\nStudies show that people who plan and prepare meals in advance consume fewer calories, eat more vegetables, and spend less money on food. The psychology is simple: when healthy food is readily available, you\'re more likely to eat it.\n\n## The Batch Cooking Method\nPrepare large quantities of versatile ingredients — roasted vegetables, grains, proteins — that can be combined in different ways throughout the week. This reduces monotony while maintaining efficiency.\n\n## Food Safety Essentials\nAlways cool cooked food to below 40°F within two hours. Most meal-prepped foods last 4–5 days in the refrigerator, while many can be frozen for months.',
    image:
      'https://images.unsplash.com/photo-1466637574441-749b8f19452f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800',
    excerpt:
      'Learn the science-backed strategies for meal prepping that will transform your diet and save time.',
  },
  {
    id: '5',
    title: 'UI Design Trends That Are Defining 2024',
    author: 'Alex Thompson',
    authorEmail: 'alex@example.com',
    status: 'published',
    date: '2024-06-05',
    category: 'Design',
    tags: ['UI', 'design', 'trends', 'web'],
    content:
      'The digital design landscape is constantly evolving. 2024 has brought some fascinating new approaches that are reshaping how we think about user interfaces.\n\n## Bento Grid Layouts\nInspired by the Japanese lunchbox, bento grids organize content into clear, modular sections. They\'re visually interesting while remaining highly organized.\n\n## AI-Powered Personalization\nInterfaces that adapt to individual user behavior are becoming the new standard. Machine learning algorithms analyze how users interact with interfaces and adjust them accordingly.\n\n## Glassmorphism 2.0\nThe frosted glass aesthetic has matured. Modern implementations are more subtle and purposeful, used for depth rather than decoration.',
    image:
      'https://images.unsplash.com/photo-1519337265831-281ec6cc8514?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800',
    excerpt:
      'Explore the cutting-edge UI design trends that leading designers and companies are adopting in 2024.',
  },
  {
    id: '6',
    title: 'Building Your First Mountain Hiking Kit',
    author: 'James Wilson',
    authorEmail: 'james@example.com',
    status: 'pending',
    date: '2024-06-22',
    category: 'Travel',
    tags: ['hiking', 'outdoors', 'gear', 'adventure'],
    content:
      'Heading into the mountains requires the right gear. Having the proper equipment can mean the difference between an enjoyable trek and a dangerous situation.\n\n## The Ten Essentials\nEvery experienced hiker knows the ten essentials: navigation tools, sun protection, insulation, illumination, first-aid supplies, fire starter, repair tools, nutrition, hydration, and emergency shelter.\n\n## Choosing Your Backpack\nFor day hikes, a 20–30L pack is usually sufficient. Multi-day trips require 50L+. Look for packs with proper hip belt support — your hips, not your shoulders, should bear most of the weight.\n\n## Footwear Fundamentals\nInvest in quality hiking boots or trail runners. Break them in before your big trip to avoid blisters. Waterproof options are worth the extra cost in unpredictable mountain weather.',
    image:
      'https://images.unsplash.com/photo-1626948688703-0136bc0a90da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800',
    excerpt:
      'Everything a beginner needs to know about assembling the perfect mountain hiking kit.',
  },
  {
    id: '7',
    title: 'The Art of Mindful Cooking',
    author: 'Rachel Kim',
    authorEmail: 'rachel@example.com',
    status: 'published',
    date: '2024-05-28',
    category: 'Food',
    tags: ['mindfulness', 'cooking', 'wellness'],
    content:
      'Cooking mindfully transforms a daily chore into a meditative practice. By bringing full attention to the process of preparing food, we can reduce stress and enhance our enjoyment of meals.\n\n## What is Mindful Cooking?\nMindful cooking means bringing full, non-judgmental awareness to every step of meal preparation — from selecting ingredients to the final plating.\n\n## The Benefits\nResearch suggests that mindful eating and cooking reduces stress, improves digestion, promotes healthier food choices, and even makes food taste better.\n\n## How to Start\nBegin with simple recipes. Put away your phone. Notice the colors, textures, and aromas of your ingredients. Listen to the sizzle of the pan. Be fully present in the kitchen.',
    image:
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800',
    excerpt:
      'Discover how bringing mindfulness to the kitchen can transform cooking from a chore into a nourishing practice.',
  },
  {
    id: '8',
    title: 'How to Start a Successful Freelance Career',
    author: 'David Martinez',
    authorEmail: 'david@example.com',
    status: 'pending',
    date: '2024-06-25',
    category: 'Business',
    tags: ['freelance', 'career', 'business'],
    content:
      'Freelancing offers unparalleled flexibility and earning potential, but it comes with unique challenges. Whether you\'re transitioning from a full-time job or starting fresh, here\'s what you need to know.\n\n## Building Your Portfolio\nYour portfolio is your most powerful sales tool. Even if you\'re starting out, create sample projects that demonstrate your skills. Pro bono work for nonprofits can provide real-world examples.\n\n## Setting Your Rates\nResearch market rates for your skill set and location. Many new freelancers undervalue themselves — don\'t. Price based on value delivered, not hours worked.\n\n## Finding Your First Clients\nStart with your existing network. Former colleagues, friends, and family are often the first source of freelance work. LinkedIn is invaluable for professional outreach.',
    image:
      'https://images.unsplash.com/photo-1501504905252-473c47e087f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800',
    excerpt:
      'A practical guide to launching and growing a successful freelance career, from building your portfolio to finding clients.',
  },
];
