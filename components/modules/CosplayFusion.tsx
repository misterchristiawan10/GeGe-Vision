import React, { useState, useEffect } from 'react';
import { GeneratorModule } from '../GeneratorModule';
import { generateCharacterDescription, generateStoryFromImage } from '../../services/geminiService';
import { ModuleId } from '../../types';
import { BookOpen, Film, Loader2, RotateCcw, RotateCw } from 'lucide-react';

interface CosplayFusionProps {
  onNavigate?: (id: ModuleId) => void;
  onTransferToStoryBoard?: (file: File) => void;
  initialState?: any;
  onStateChange?: (state: any) => void;
}

// ... (Constants remain the same) ...
const GENDERS = ['Laki-laki (1 Org)', 'Perempuan (1 Org)', 'Couple (Laki+Pr)', 'Couple (Laki+Laki)', 'Couple (Pr+Pr)'];
const MODES = ['Karakter Anime', 'Video Game', 'Super Hero', 'Film / Movie', 'Tokoh Sejarah', 'Profesi Unik', 'Custom'];
type CharDef = { label: string, gender: 'Male' | 'Female' };
const SERIES_DATA: Record<string, { name: string, chars: CharDef[] }[]> = {
  'Karakter Anime': [
    { name: 'Naruto', chars: [{ label: 'Naruto Uzumaki', gender: 'Male' }, { label: 'Sasuke Uchiha', gender: 'Male' }, { label: 'Kakashi Hatake', gender: 'Male' }, { label: 'Itachi Uchiha', gender: 'Male' }, { label: 'Jiraiya', gender: 'Male' }, { label: 'Gaara', gender: 'Male' }, { label: 'Minato Namikaze', gender: 'Male' }, { label: 'Madara Uchiha', gender: 'Male' }, { label: 'Sakura Haruno', gender: 'Female' }, { label: 'Hinata Hyuga', gender: 'Female' }, { label: 'Tsunade', gender: 'Female' }, { label: 'Ino Yamanaka', gender: 'Female' }, { label: 'Temari', gender: 'Female' }, { label: 'Konan', gender: 'Female' }] },
    { name: 'One Piece', chars: [{ label: 'Monkey D. Luffy', gender: 'Male' }, { label: 'Roronoa Zoro', gender: 'Male' }, { label: 'Vinsmoke Sanji', gender: 'Male' }, { label: 'Portgas D. Ace', gender: 'Male' }, { label: 'Trafalgar Law', gender: 'Male' }, { label: 'Shanks', gender: 'Male' }, { label: 'Sabo', gender: 'Male' }, { label: 'Nami', gender: 'Female' }, { label: 'Nico Robin', gender: 'Female' }, { label: 'Boa Hancock', gender: 'Female' }, { label: 'Yamato', gender: 'Female' }, { label: 'Uta', gender: 'Female' }, { label: 'Vivi Nefertari', gender: 'Female' }] },
    { name: 'Pokemon', chars: [{ label: 'Ash Ketchum (Satoshi)', gender: 'Male' }, { label: 'Brock (Takeshi)', gender: 'Male' }, { label: 'James (Kojiro)', gender: 'Male' }, { label: 'Red', gender: 'Male' }, { label: 'Misty (Kasumi)', gender: 'Female' }, { label: 'May (Haruka)', gender: 'Female' }, { label: 'Dawn (Hikari)', gender: 'Female' }, { label: 'Serena', gender: 'Female' }, { label: 'Jessie (Musashi)', gender: 'Female' }, { label: 'Cynthia (Shirona)', gender: 'Female' }, { label: 'Nurse Joy', gender: 'Female' }] },
    { name: 'Dragon Ball', chars: [{ label: 'Son Goku', gender: 'Male' }, { label: 'Vegeta', gender: 'Male' }, { label: 'Gohan', gender: 'Male' }, { label: 'Trunks', gender: 'Male' }, { label: 'Piccolo', gender: 'Male' }, { label: 'Android 17', gender: 'Male' }, { label: 'Bulma', gender: 'Female' }, { label: 'Android 18', gender: 'Female' }, { label: 'Chi-Chi', gender: 'Female' }, { label: 'Videl', gender: 'Female' }] },
    { name: 'My Hero Academia', chars: [{ label: 'Izuku Midoriya (Deku)', gender: 'Male' }, { label: 'Katsuki Bakugo', gender: 'Male' }, { label: 'Shoto Todoroki', gender: 'Male' }, { label: 'All Might', gender: 'Male' }, { label: 'Hawks', gender: 'Male' }, { label: 'Ochaco Uraraka', gender: 'Female' }, { label: 'Momo Yaoyorozu', gender: 'Female' }, { label: 'Himiko Toga', gender: 'Female' }, { label: 'Tsuyu Asui', gender: 'Female' }, { label: 'Mirko', gender: 'Female' }] },
    { name: 'Bleach', chars: [{ label: 'Ichigo Kurosaki', gender: 'Male' }, { label: 'Byakuya Kuchiki', gender: 'Male' }, { label: 'Toshiro Hitsugaya', gender: 'Male' }, { label: 'Kenpachi Zaraki', gender: 'Male' }, { label: 'Grimmjow', gender: 'Male' }, { label: 'Ulquiorra Cifer', gender: 'Male' }, { label: 'Rukia Kuchiki', gender: 'Female' }, { label: 'Orihime Inoue', gender: 'Female' }, { label: 'Yoruichi Shihoin', gender: 'Female' }, { label: 'Rangiku Matsumoto', gender: 'Female' }, { label: 'Neliel', gender: 'Female' }] },
    { name: 'Demon Slayer', chars: [{ label: 'Tanjiro Kamado', gender: 'Male' }, { label: 'Zenitsu Agatsuma', gender: 'Male' }, { label: 'Inosuke Hashibira', gender: 'Male' }, { label: 'Giyu Tomioka', gender: 'Male' }, { label: 'Kyojuro Rengoku', gender: 'Male' }, { label: 'Tengen Uzui', gender: 'Male' }, { label: 'Nezuko Kamado', gender: 'Female' }, { label: 'Shinobu Kocho', gender: 'Female' }, { label: 'Mitsuri Kanroji', gender: 'Female' }, { label: 'Kanao Tsuyuri', gender: 'Female' }, { label: 'Daki', gender: 'Female' }] },
    { name: 'Jujutsu Kaisen', chars: [{ label: 'Yuji Itadori', gender: 'Male' }, { label: 'Satoru Gojo', gender: 'Male' }, { label: 'Megumi Fushiguro', gender: 'Male' }, { label: 'Ryomen Sukuna', gender: 'Male' }, { label: 'Kento Nanami', gender: 'Male' }, { label: 'Yuta Okkotsu', gender: 'Male' }, { label: 'Toji Fushiguro', gender: 'Male' }, { label: 'Geto Suguru', gender: 'Male' }, { label: 'Nobara Kugisaki', gender: 'Female' }, { label: 'Maki Zenin', gender: 'Female' }, { label: 'Mei Mei', gender: 'Female' }, { label: 'Yuki Tsukumo', gender: 'Female' }] },
    { name: 'Hunter x Hunter', chars: [{ label: 'Gon Freecss', gender: 'Male' }, { label: 'Killua Zoldyck', gender: 'Male' }, { label: 'Kurapika', gender: 'Male' }, { label: 'Hisoka Morow', gender: 'Male' }, { label: 'Chrollo Lucilfer', gender: 'Male' }, { label: 'Biscuit Krueger', gender: 'Female' }, { label: 'Machi', gender: 'Female' }, { label: 'Shizuku', gender: 'Female' }] },
    { name: 'Chainsaw Man', chars: [{ label: 'Denji', gender: 'Male' }, { label: 'Aki Hayakawa', gender: 'Male' }, { label: 'Makima', gender: 'Female' }, { label: 'Power', gender: 'Female' }, { label: 'Reze', gender: 'Female' }, { label: 'Himeno', gender: 'Female' }, { label: 'Kobeni', gender: 'Female' }] },
    { name: 'Inuyasha', chars: [{ label: 'Inuyasha', gender: 'Male' }, { label: 'Sesshomaru', gender: 'Male' }, { label: 'Miroku', gender: 'Male' }, { label: 'Kagome Higurashi', gender: 'Female' }, { label: 'Kikyo', gender: 'Female' }, { label: 'Sango', gender: 'Female' }] },
    { name: 'Spy x Family', chars: [{ label: 'Loid Forger', gender: 'Male' }, { label: 'Yor Forger', gender: 'Female' }, { label: 'Anya Forger', gender: 'Female' }, { label: 'Fiona Frost', gender: 'Female' }] },
    { name: 'Attack on Titan', chars: [{ label: 'Eren Yeager', gender: 'Male' }, { label: 'Levi Ackerman', gender: 'Male' }, { label: 'Armin Arlert', gender: 'Male' }, { label: 'Erwin Smith', gender: 'Male' }, { label: 'Mikasa Ackerman', gender: 'Female' }, { label: 'Annie Leonhart', gender: 'Female' }, { label: 'Historia Reiss', gender: 'Female' }, { label: 'Sasha Braus', gender: 'Female' }, { label: 'Hange Zoe', gender: 'Female' }] },
    { name: 'Fate Series', chars: [{ label: 'Gilgamesh', gender: 'Male' }, { label: 'Emiya Shirou', gender: 'Male' }, { label: 'Archer', gender: 'Male' }, { label: 'Lancer (Cu Chulainn)', gender: 'Male' }, { label: 'Saber (Artoria)', gender: 'Female' }, { label: 'Rin Tohsaka', gender: 'Female' }, { label: 'Jeanne d\'Arc', gender: 'Female' }, { label: 'Nero Claudius', gender: 'Female' }, { label: 'Ishtar', gender: 'Female' }, { label: 'Mash Kyrielight', gender: 'Female' }] },
    { name: 'Sailor Moon', chars: [{ label: 'Tuxedo Mask', gender: 'Male' }, { label: 'Usagi Tsukino (Sailor Moon)', gender: 'Female' }, { label: 'Ami Mizuno (Sailor Mercury)', gender: 'Female' }, { label: 'Rei Hino (Sailor Mars)', gender: 'Female' }, { label: 'Makoto Kino (Sailor Jupiter)', gender: 'Female' }, { label: 'Minako Aino (Sailor Venus)', gender: 'Female' }, { label: 'Chibiusa', gender: 'Female' }] },
    { name: 'Cyberpunk: Edgerunners', chars: [{ label: 'David Martinez', gender: 'Male' }, { label: 'Lucy', gender: 'Female' }, { label: 'Rebecca', gender: 'Female' }] }
  ],
  'Video Game': [
    { name: 'Mobile Legends', chars: [{ label: 'Alucard', gender: 'Male' }, { label: 'Gusion', gender: 'Male' }, { label: 'Chou', gender: 'Male' }, { label: 'Granger', gender: 'Male' }, { label: 'Tigreal', gender: 'Male' }, { label: 'Yin', gender: 'Male' }, { label: 'Ling', gender: 'Male' }, { label: 'Miya', gender: 'Female' }, { label: 'Layla', gender: 'Female' }, { label: 'Fanny', gender: 'Female' }, { label: 'Kagura', gender: 'Female' }, { label: 'Lesley', gender: 'Female' }, { label: 'Guinevere', gender: 'Female' }, { label: 'Odette', gender: 'Female' }, { label: 'Selena', gender: 'Female' }, { label: 'Rafaela', gender: 'Female' }] },
    { name: 'Genshin Impact', chars: [{ label: 'Zhongli', gender: 'Male' }, { label: 'Xiao', gender: 'Male' }, { label: 'Diluc', gender: 'Male' }, { label: 'Tartaglia (Childe)', gender: 'Male' }, { label: 'Alhaitham', gender: 'Male' }, { label: 'Neuvillette', gender: 'Male' }, { label: 'Raiden Shogun', gender: 'Female' }, { label: 'Hu Tao', gender: 'Female' }, { label: 'Ganyu', gender: 'Female' }, { label: 'Yae Miko', gender: 'Female' }, { label: 'Nahida', gender: 'Female' }, { label: 'Furina', gender: 'Female' }, { label: 'Navia', gender: 'Female' }, { label: 'Kamisato Ayaka', gender: 'Female' }] },
    { name: 'Honkai: Star Rail', chars: [{ label: 'Dan Heng', gender: 'Male' }, { label: 'Jing Yuan', gender: 'Male' }, { label: 'Blade', gender: 'Male' }, { label: 'Welt Yang', gender: 'Male' }, { label: 'Caelus (Trailblazer)', gender: 'Male' }, { label: 'Kafka', gender: 'Female' }, { label: 'March 7th', gender: 'Female' }, { label: 'Himeko', gender: 'Female' }, { label: 'Seele', gender: 'Female' }, { label: 'Bronya', gender: 'Female' }, { label: 'Silver Wolf', gender: 'Female' }, { label: 'Stelle (Trailblazer)', gender: 'Female' }] },
    { name: 'Final Fantasy', chars: [{ label: 'Cloud Strife', gender: 'Male' }, { label: 'Sephiroth', gender: 'Male' }, { label: 'Squall Leonhart', gender: 'Male' }, { label: 'Tidus', gender: 'Male' }, { label: 'Noctis', gender: 'Male' }, { label: 'Tifa Lockhart', gender: 'Female' }, { label: 'Aerith Gainsborough', gender: 'Female' }, { label: 'Yuna', gender: 'Female' }, { label: 'Lightning', gender: 'Female' }, { label: 'Terra Branford', gender: 'Female' }] },
    { name: 'League of Legends (Arcane)', chars: [{ label: 'Yasuo', gender: 'Male' }, { label: 'Yone', gender: 'Male' }, { label: 'Viego', gender: 'Male' }, { label: 'Ezreal', gender: 'Male' }, { label: 'Jayce', gender: 'Male' }, { label: 'Ahri', gender: 'Female' }, { label: 'Jinx', gender: 'Female' }, { label: 'Vi', gender: 'Female' }, { label: 'Lux', gender: 'Female' }, { label: 'Akali', gender: 'Female' }, { label: 'Kai\'sa', gender: 'Female' }, { label: 'Caitlyn', gender: 'Female' }, { label: 'Miss Fortune', gender: 'Female' }] },
    { name: 'Valorant', chars: [{ label: 'Phoenix', gender: 'Male' }, { label: 'Sova', gender: 'Male' }, { label: 'Chamber', gender: 'Male' }, { label: 'Yoru', gender: 'Male' }, { label: 'Omen', gender: 'Male' }, { label: 'Jett', gender: 'Female' }, { label: 'Sage', gender: 'Female' }, { label: 'Reyna', gender: 'Female' }, { label: 'Viper', gender: 'Female' }, { label: 'Neon', gender: 'Female' }, { label: 'Killjoy', gender: 'Female' }] },
    { name: 'Resident Evil', chars: [{ label: 'Leon S. Kennedy', gender: 'Male' }, { label: 'Chris Redfield', gender: 'Male' }, { label: 'Albert Wesker', gender: 'Male' }, { label: 'Ada Wong', gender: 'Female' }, { label: 'Jill Valentine', gender: 'Female' }, { label: 'Claire Redfield', gender: 'Female' }] }
  ],
  'Super Hero': [
    { name: 'Marvel', chars: [{ label: 'Iron Man', gender: 'Male' }, { label: 'Captain America', gender: 'Male' }, { label: 'Thor', gender: 'Male' }, { label: 'Spider-Man', gender: 'Male' }, { label: 'Doctor Strange', gender: 'Male' }, { label: 'Black Panther', gender: 'Male' }, { label: 'Wolverine', gender: 'Male' }, { label: 'Deadpool', gender: 'Male' }, { label: 'Loki', gender: 'Male' }, { label: 'Black Widow', gender: 'Female' }, { label: 'Scarlet Witch', gender: 'Female' }, { label: 'Captain Marvel', gender: 'Female' }, { label: 'Gamora', gender: 'Female' }, { label: 'Storm', gender: 'Female' }, { label: 'Jean Grey', gender: 'Female' }] },
    { name: 'DC', chars: [{ label: 'Batman', gender: 'Male' }, { label: 'Superman', gender: 'Male' }, { label: 'The Joker', gender: 'Male' }, { label: 'Aquaman', gender: 'Male' }, { label: 'The Flash', gender: 'Male' }, { label: 'Nightwing', gender: 'Male' }, { label: 'Wonder Woman', gender: 'Female' }, { label: 'Harley Quinn', gender: 'Female' }, { label: 'Catwoman', gender: 'Female' }, { label: 'Supergirl', gender: 'Female' }, { label: 'Poison Ivy', gender: 'Female' }] },
  ],
  'Film / Movie': [
    { name: 'Star Wars', chars: [{ label: 'Darth Vader', gender: 'Male' }, { label: 'Luke Skywalker', gender: 'Male' }, { label: 'Kylo Ren', gender: 'Male' }, { label: 'Mandalorian', gender: 'Male' }, { label: 'Obi-Wan Kenobi', gender: 'Male' }, { label: 'Anakin Skywalker', gender: 'Male' }, { label: 'Princess Leia', gender: 'Female' }, { label: 'Rey', gender: 'Female' }, { label: 'Padme Amidala', gender: 'Female' }, { label: 'Ahsoka Tano', gender: 'Female' }] },
    { name: 'Harry Potter', chars: [{ label: 'Harry Potter', gender: 'Male' }, { label: 'Ron Weasley', gender: 'Male' }, { label: 'Draco Malfoy', gender: 'Male' }, { label: 'Albus Dumbledore', gender: 'Male' }, { label: 'Severus Snape', gender: 'Male' }, { label: 'Hermione Granger', gender: 'Female' }, { label: 'Luna Lovegood', gender: 'Female' }, { label: 'Ginny Weasley', gender: 'Female' }, { label: 'Bellatrix Lestrange', gender: 'Female' }] },
    { name: 'Lord of the Rings', chars: [{ label: 'Aragorn', gender: 'Male' }, { label: 'Legolas', gender: 'Male' }, { label: 'Gandalf', gender: 'Male' }, { label: 'Frodo Baggins', gender: 'Male' }, { label: 'Arwen', gender: 'Female' }, { label: 'Galadriel', gender: 'Female' }, { label: 'Eowyn', gender: 'Female' }] }
  ]
};
const LOCATIONS = ['✨ Auto (AI)', 'Studio Foto', 'Hutan Fantasi', 'Kota Cyberpunk', 'Medan Perang', 'Kastil Kerajaan', 'Ruang Angkasa', 'Kuil Jepang', 'Pantai', 'Sekolah Anime', '✎ Custom'];
const TIMES = ['✨ Auto (AI)', 'Matahari Terbit (Sunrise)', 'Pagi Cerah', 'Siang Hari (High Noon)', 'Sore (Golden Hour)', 'Senja (Blue Hour)', 'Malam (City Lights)', 'Tengah Malam (Gelap)'];
const CAMERA_ANGLES = ['✨ Auto (AI)', 'Selevel Mata (Eye Level)', 'Sudut Rendah (Low Angle)', 'Sudut Tinggi (High Angle)', 'Wide Shot (Full Body)', 'Potret Close-up', 'Dutch Angle (Miring)', 'Over the Shoulder', 'Drone View (Aerial)', 'GoPro View (Fisheye)', 'Macro (Detail)', 'Telephoto (Compressed Background)'];
const LIGHTING = ['✨ Auto (AI)', 'Cinematic', 'Soft Portrait', 'Rembrandt', 'Neon Glow', 'Dark & Moody', 'Natural'];
const POSE_OPTIONS = [
    { value: "auto", label: "✨ Auto (AI)" },
    { label: "Berdiri & Formal", options: [{ value: "standing_formal", label: "Berdiri Formal (Tangan di Samping)" }, { value: "standing_elegant", label: "Berdiri Anggun (Satu Tangan di Pinggang)" }, { value: "standing", label: "Berdiri Tegap (Standar)" }, { value: "arms_crossed", label: "Pose Wibawa (Tangan Melipat di Dada)" }, { value: "leaning", label: "Bersandar pada Tiang/Dinding" },] },
    { label: "Duduk & Santai", options: [{ value: "sitting_antique", label: "Duduk Santai di Kursi Antik" }, { value: "sitting_floor", label: "Duduk Lesehan Anggun" }, { value: "sitting", label: "Duduk (Umum)" }, { value: "kneeling", label: "Berlutut" }, { value: "meditative", label: "Pose Meditatif/Tenang" },] },
    { label: "Gerakan & Aksi", options: [{ value: "walking_elegant", label: "Pose Berjalan Elegan (Walking Shot)" }, { value: "traditional_dance", label: "Pose Gerakan Tari Tradisional" }, { value: "dynamic_fabric", label: "Pose Dinamis (Kain Berkibar)" }, { value: "action", label: "Pose Aksi / Bertarung" }, { value: "dynamic_jump", label: "Melompat Dinamis" }, { value: "casting_spell", label: "Casting Spell" }, { value: "flying", label: "Melayang / Terbang" },] },
    { label: "Ekspresi & Interaksi", options: [{ value: "greeting_namaste", label: "Pose Menyapa (Salam Namaste/Sembah)" }, { value: "offering", label: "Pose Interaksi (Menawarkan Sesuatu)" }, { value: "holding_prop", label: "Pose Memegang Properti (Kipas/Keris)" }, { value: "candid_laugh", label: "Candid Tertawa Natural" }, { value: "playful", label: "Gaya Bebas Ceria (Playful)" }, { value: "touching_chin", label: "Pose Tangan Menyentuh Dagu (Reflektif)" }, { value: "pensive", label: "Merenung (Pensive)" },] },
    { label: "Artistik & Fashion", options: [{ value: "fashion_editorial", label: "Pose Fashion High-End (Editorial)" }, { value: "side_profile", label: "Pose Menoleh ke Samping (Side Profile)" }, { value: "close_up_beauty", label: "Close Up Wajah (Beauty Portrait)" }, { value: "silhouette_mystery", label: "Pose Siluet Misterius" }, { value: "dramatic", label: "Dramatic Look" },] },
    { value: "manual_pose", label: "✎ Input Manual" }
];
const VISUAL_EFFECT_OPTIONS = [
  { value: "auto", label: "✨ Auto (AI)" }, { value: "none", label: "Tidak Ada Efek" }, { value: "volumetric_dust", label: "Cahaya Berdebu" }, { value: "bioluminescent_glow", label: "Bioluminescent Glow" }, { value: "neon_bloom", label: "Neon Bloom / Light Bloom" }, { value: "aura_glow", label: "Aura Glow" }, { value: "bio_organic_light", label: "Bio-Organic Light" }, { value: "luminescent_gradient", label: "Luminescent Gradient" }, { value: "subsurface-scattering", label: "Subsurface Scattering Glow" }, { value: "particle_sparkle", label: "Particle Sparkle / Fairy Dust" }, { value: "holographic_light", label: "Holographic Light" }, { value: "fluorescent_organic", label: "Fluorescent Organic" }, { value: "cinematic", label: "Cinematic Lighting" }, { value: "bokeh", label: "Bokeh Kuat (Shallow DOF)" }, { value: "chromatic", label: "Chromatic Aberration" }, { value: "glitch", label: "Glitch Effect" }, { value: "fog", label: "Fog / Mist" }, { value: "rain", label: "Rain / Wet" }, { value: "fire", label: "Fire / Sparks" }, { value: "hdr", label: "HDR High Contrast" }, { value: "surreal_fractal", label: "Surealisme: Fraktal Dimensi Kaca" }, { value: "surreal_liquid", label: "Surealisme: Realitas Cair Kromatik" }, { value: "surreal_entropy", label: "Surealisme: Kabus Entropi Lisergis" }, { value: "surreal_fusion", label: "Surealisme: Metamorfosis & Fusi" }, { value: "surreal_architecture", label: "Surealisme: Arsitektur & Perspektif Mustahil" }, { value: "surreal_juxtaposition", label: "Surealisme: Jukstaposisi & Skala Ekstrem" }, { value: "surreal_time", label: "Surealisme: Manipulasi Waktu & Gerakan" }
];
const MAKEUP_STYLES = [
  { value: 'auto', label: '✨ Auto (AI)' }, { value: 'natural_no_makeup', label: 'No Makeup / Natural Look' }, { value: 'soft_glam', label: 'Soft Glam (Natural Radiance)' }, { value: 'full_glam', label: 'Full Glam (Heavy Makeup)' }, { value: 'editorial_fashion', label: 'Editorial / High Fashion' }, { value: 'korean_glass_skin', label: 'Korean Glass Skin (Dewy)' }, { value: 'smokey_eyes', label: 'Smokey Eyes & Nude Lips' }, { value: 'vintage_retro', label: 'Vintage / Retro (Red Lips)' }, { value: 'goth_dark', label: 'Gothic / Dark Aesthetics' }, { value: 'fantasy_ethereal', label: 'Fantasy / Ethereal (Glitter)' }, { value: 'cyberpunk_neon', label: 'Cyberpunk / Neon Accents' }, { value: 'bridal', label: 'Bridal / Wedding Day' }, { value: 'matte_finish', label: 'Matte Finish (Velvet Skin)' }, { value: 'glossy_wet', label: 'Glossy / Wet Look' }, { value: 'bronzed_beach', label: 'Bronzed / Sun-Kissed' }
];

interface SettingsState {
    gender: string;
    mode: string;
    selectedSeries: string;
    selectedChar: string;
    customSeries: string;
    customChar: string;
    location: string;
    customLocation: string;
    time: string;
    angle: string;
    lighting: string;
    pose: string;
    customPose: string;
    visualEffect: string;
    makeup: string;
    accessories: string;
}

export const CosplayFusionModule: React.FC<CosplayFusionProps> = ({ onNavigate, onTransferToStoryBoard, initialState, onStateChange }) => {
  const [settings, setSettingsState] = useState<SettingsState>({
    gender: GENDERS[0],
    mode: MODES[0],
    selectedSeries: '',
    selectedChar: '',
    customSeries: '',
    customChar: '',
    location: LOCATIONS[0],
    customLocation: '',
    time: TIMES[0],
    angle: CAMERA_ANGLES[0],
    lighting: LIGHTING[0],
    pose: 'auto',
    customPose: '',
    visualEffect: VISUAL_EFFECT_OPTIONS[0].value,
    makeup: MAKEUP_STYLES[0].value,
    accessories: '',
  });

  const [seriesList, setSeriesList] = useState<{ name: string, chars: CharDef[] }[]>([]);
  const [charList, setCharList] = useState<string[]>([]);
  
  const [promptLoading, setPromptLoading] = useState(false);
  const [generatedStory, setGeneratedStory] = useState('');
  const [isStoryLoading, setIsStoryLoading] = useState(false);

  // --- Settings History ---
  const [history, setHistory] = useState<SettingsState[]>([settings]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    const updated = { ...settings, ...newSettings };
    setSettingsState(updated);
    
    // Add to history and cut off redo path
    const newHistory = [...history.slice(0, historyIndex + 1), updated];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setSettingsState(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setSettingsState(history[newIndex]);
      setHistoryIndex(newIndex);
    }
  };
  
  // Load initial state
  useEffect(() => {
    if (initialState) {
        if (initialState.history && initialState.history.length > 0) {
            setHistory(initialState.history);
            const newIndex = initialState.historyIndex ?? initialState.history.length - 1;
            setHistoryIndex(newIndex);
            setSettingsState(initialState.history[newIndex]);
        } else {
             setSettingsState(s => ({ ...s, ...initialState })); // Legacy support
             setHistory([initialState]);
             setHistoryIndex(0);
        }
        setGeneratedStory(initialState.generatedStory || '');
    }
  }, [initialState]);

  // Save state on change
  useEffect(() => {
    const state = {
        history,
        historyIndex,
        generatedStory
    };
    onStateChange?.(state);
  }, [history, historyIndex, generatedStory]);

  // Update Series List when Mode changes
  useEffect(() => {
    if (SERIES_DATA[settings.mode]) {
      setSeriesList(SERIES_DATA[settings.mode]);
      if (settings.mode !== history[historyIndex - 1]?.mode) { // Only reset if mode actually changed
          updateSettings({ selectedSeries: '', selectedChar: '' });
      }
    } else {
      setSeriesList([]);
    }
  }, [settings.mode]);

  // Update Char List when Series or Gender changes
  useEffect(() => {
    const found = seriesList.find(s => s.name === settings.selectedSeries);
    if (found) {
      const filtered = found.chars.filter(c => {
        if (settings.gender === 'Laki-laki (1 Org)') return c.gender === 'Male';
        if (settings.gender === 'Perempuan (1 Org)') return c.gender === 'Female';
        return true; 
      });
      
      setCharList(filtered.map(c => c.label));
      if (settings.selectedSeries !== history[historyIndex - 1]?.selectedSeries || settings.gender !== history[historyIndex - 1]?.gender) {
        updateSettings({ selectedChar: '' });
      }
    } else {
      setCharList([]);
    }
  }, [settings.selectedSeries, seriesList, settings.gender]);

  const handleGenerateCharPrompt = async () => {
    const char = settings.mode === 'Custom' || !SERIES_DATA[settings.mode] ? settings.customChar : settings.selectedChar;
    const series = settings.mode === 'Custom' || !SERIES_DATA[settings.mode] ? settings.customSeries : settings.selectedSeries;
    
    if (!char) return;
    
    setPromptLoading(true);
    try {
      const desc = await generateCharacterDescription(char, series);
      return desc; 
    } catch (e) {
      console.error(e);
      return "";
    } finally {
      setPromptLoading(false);
    }
  };

  const getPoseLabel = (val: string) => {
    if (val === 'auto') return '';
    for (const group of POSE_OPTIONS) {
        if ('options' in group && group.options) {
             const found = group.options.find((o: any) => o.value === val);
             if (found) return found.label;
        } else if ('value' in group && group.value === val) {
             return group.label;
        }
    }
    return val;
  };

  const getDetailedMakeupPrompt = (makeupValue: string) => {
    switch (makeupValue) {
      case 'auto': return '';
      case 'natural_no_makeup': return 'Professional Character Makeup: Extremely natural "no-makeup" look, perfect skin texture, subtle definition, high-res pores.';
      case 'soft_glam': return 'Cosplay Soft Glam: Flawless anime-style base, soft contour, defined lash line, gradient lips, airbrushed finish but realistic texture.';
      case 'full_glam': return 'Heavy Cosplay Glam: High coverage foundation, sharp contouring, cut-crease eyeshadow, large false lashes, matte bold lips, stage-ready makeup.';
      case 'editorial_fashion': return 'High-Concept Editorial Makeup: Avant-garde aesthetic, unique graphic liners, glossy skin, artistic blush placement, magazine cover quality.';
      case 'korean_glass_skin': return 'Korean Glass Skin (Manhwa Style): Ultra-dewy complexion, straight brows, puppy eyeliner, gradient fruit-colored lips, youthful and radiant.';
      case 'smokey_eyes': return 'Dramatic Smokey Eye: Intense charcoal/black gradient eyeshadow, smudged lower lash line, nude lips, intense gaze for villains or anti-heroes.';
      case 'vintage_retro': return 'Retro Classic Makeup: Sharp winged liner, classic red matte lips, matte skin finish, 1950s pin-up aesthetic.';
      case 'goth_dark': return 'Gothic Character Makeup: Pale foundation, heavy black eyeshadow, dark plum/black lipstick, sharp contours, vampire/goth aesthetic.';
      case 'fantasy_ethereal': return 'Ethereal Fantasy Makeup: Iridescent highlights, face gems/glitter, soft pastel tones, magical glow, elf/fairy aesthetic.';
      case 'cyberpunk_neon': return 'Cyberpunk Neon Makeup: UV-reactive style graphic liner (neon pink/blue), metallic skin accents, futuristic android aesthetic.';
      case 'bridal': return 'Bridal Cosplay Makeup: Soft pinks and peaches, radiant glowing base, romantic eye makeup, blushing cheeks, timeless beauty.';
      case 'matte_finish': return 'Velvet Matte Skin: Zero shine, porcelain doll-like finish, full coverage, perfect for anime character skin replication.';
      case 'glossy_wet': return 'Wet Look Makeup: Glossy eyelids, high-shine cheekbones, glass lips, sweaty/action hero aesthetic.';
      case 'bronzed_beach': return 'Sun-Kissed Beach Makeup: Warm bronzer, faux freckles, golden highlighter, summer glow suitable for swimsuit cosplay.';
      default: return 'High Quality Professional Cosplay Makeup.';
    }
  };

  const getPrompt = () => {
    const { gender, mode, selectedChar, customChar, selectedSeries, customSeries, location, customLocation, time, angle, lighting, pose, customPose, visualEffect, accessories, makeup } = settings;

    const characterName = mode === 'Custom' || !SERIES_DATA[mode] ? customChar : selectedChar;
    const seriesName = mode === 'Custom' || !SERIES_DATA[mode] ? customSeries : selectedSeries;
    
    const locationVal = location === '✎ Custom' ? customLocation : location;
    
    const poseLabel = getPoseLabel(pose);
    const poseVal = pose === 'manual_pose' ? customPose : (pose === 'auto' ? '' : poseLabel);
    
    const visualEffectLabel = VISUAL_EFFECT_OPTIONS.find(v => v.value === visualEffect)?.label || visualEffect;
    
    const makeupPrompt = getDetailedMakeupPrompt(makeup);

    const details = [
      locationVal !== '✨ Auto (AI)' && locationVal ? `Lokasi: ${locationVal}` : '',
      time !== '✨ Auto (AI)' ? `Waktu: ${time}` : '',
      angle !== '✨ Auto (AI)' ? `Angle: ${angle}` : '',
      lighting !== '✨ Auto (AI)' ? `Pencahayaan: ${lighting}` : '',
      poseVal ? `Pose: ${poseVal}` : '',
      visualEffect !== 'auto' ? `Efek Visual: ${visualEffectLabel}` : '',
      accessories ? `Aksesoris/Senjata: ${accessories}` : ''
    ].filter(Boolean).join(', ');

    return `Fotografi Cosplay Profesional (${gender}). 
    Karakter: ${characterName} dari seri ${seriesName}.
    Detail Kostum Akurat. Kualitas 8k, Tekstur Realistis.
    
    [PROFESSIONAL MAKEUP INSTRUCTION]:
    ${makeupPrompt ? `Apply specific makeup style: ${makeupPrompt}` : 'Ensure makeup is character-accurate and high definition.'}
    
    ${details}.`;
  };

  const handleGenerateStory = async (imageUrl: string) => {
    const characterName = settings.mode === 'Custom' || !SERIES_DATA[settings.mode] ? settings.customChar : settings.selectedChar;
    if (!characterName) return;

    setIsStoryLoading(true);
    setGeneratedStory('');
    
    try {
      const story = await generateStoryFromImage(imageUrl, characterName);
      setGeneratedStory(story);
    } catch (e) {
      console.error(e);
      setGeneratedStory("Maaf, gagal membuat cerita saat ini.");
    } finally {
      setIsStoryLoading(false);
    }
  };

  const handleTransfer = async (imageUrl: string) => {
    if (!onTransferToStoryBoard || !onNavigate) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const file = new File([blob], "cosplay-result.png", { type: "image/png" });
      onTransferToStoryBoard(file);
      onNavigate('story-board');
    } catch (e) {
      console.error("Transfer failed", e);
    }
  };

  const renderCustomResultActions = (imageUrl: string) => (
    <div className="flex flex-col gap-4 mt-2">
       <div className="flex gap-2">
          <button
            onClick={() => handleGenerateStory(imageUrl)}
            disabled={isStoryLoading}
            className="flex-1 py-2 px-3 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
             {isStoryLoading ? <Loader2 size={14} className="animate-spin"/> : <BookOpen size={14}/>}
             {isStoryLoading ? 'Menulis Cerita...' : 'Buat Cerita (AI)'}
          </button>
          
          <button
            onClick={() => handleTransfer(imageUrl)}
            className="flex-1 py-2 px-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
             <Film size={14}/> Transfer ke Smart Storyboard
          </button>
       </div>

       {generatedStory && (
          <div className="bg-white/80 dark:bg-black/40 p-4 rounded-xl border border-purple-200 dark:border-purple-800 text-sm text-gray-800 dark:text-gray-200 animate-fade-in max-h-60 overflow-y-auto">
             <h4 className="font-bold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-2">
                <BookOpen size={16}/> Cerita Karakter
             </h4>
             <p className="whitespace-pre-wrap leading-relaxed font-serif">{generatedStory}</p>
          </div>
       )}
    </div>
  );

  const { gender, mode, selectedSeries, selectedChar, customSeries, customChar, location, customLocation, time, angle, lighting, pose, customPose, visualEffect, makeup, accessories } = settings;

  const extraControls = (
    <div className="space-y-4">
       <div className="flex justify-end gap-2 mb-2">
           <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-1.5 text-gray-400 disabled:opacity-30 hover:text-white"><RotateCcw size={14}/></button>
           <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-1.5 text-gray-400 disabled:opacity-30 hover:text-white"><RotateCw size={14}/></button>
       </div>
       <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
             <label className="text-[10px] font-semibold text-gray-500 uppercase">Gender</label>
             <select 
               value={gender}
               onChange={(e) => updateSettings({ gender: e.target.value })}
               className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-sm dark:text-white outline-none"
             >
               {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
             </select>
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-semibold text-gray-500 uppercase">Mode Karakter</label>
             <select 
               value={mode}
               onChange={(e) => updateSettings({ mode: e.target.value })}
               className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-sm dark:text-white outline-none"
             >
               {MODES.map(m => <option key={m} value={m}>{m}</option>)}
             </select>
          </div>
       </div>

       {(SERIES_DATA[mode]) ? (
         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className="text-[10px] font-semibold text-gray-500 uppercase">{mode === 'Video Game' ? 'Game' : 'Anime / Series'}</label>
               <select 
                 value={selectedSeries}
                 onChange={(e) => updateSettings({ selectedSeries: e.target.value })}
                 className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-sm dark:text-white outline-none"
               >
                 <option value="">-- Pilih --</option>
                 {seriesList.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
               </select>
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-semibold text-gray-500 uppercase">Karakter</label>
               <select 
                 value={selectedChar}
                 onChange={(e) => updateSettings({ selectedChar: e.target.value })}
                 disabled={!selectedSeries}
                 className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-sm dark:text-white outline-none disabled:opacity-50"
               >
                 <option value="">-- Pilih Karakter --</option>
                 {charList.length > 0 ? (
                    charList.map(c => <option key={c} value={c}>{c}</option>)
                 ) : (
                    <option value="" disabled>Tidak ada karakter yang cocok dengan gender</option>
                 )}
               </select>
            </div>
         </div>
       ) : (
         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className="text-[10px] font-semibold text-gray-500 uppercase">Nama Seri / Sumber</label>
               <input 
                 type="text" 
                 value={customSeries}
                 onChange={(e) => updateSettings({ customSeries: e.target.value })}
                 placeholder="Cth: Marvel, Sejarah Indonesia..."
                 className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-sm dark:text-white outline-none"
               />
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-semibold text-gray-500 uppercase">Nama Karakter</label>
               <input 
                 type="text" 
                 value={customChar}
                 onChange={(e) => updateSettings({ customChar: e.target.value })}
                 placeholder="Cth: Iron Man, Gajah Mada..."
                 className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-sm dark:text-white outline-none"
               />
            </div>
         </div>
       )}

       <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="space-y-1">
             <label className="text-[10px] font-semibold text-gray-500 uppercase">Lokasi</label>
             {location === '✎ Custom' ? (
                <div className="flex gap-2">
                   <input 
                     type="text"
                     value={customLocation}
                     onChange={(e) => updateSettings({ customLocation: e.target.value })}
                     placeholder="Lokasi..."
                     className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-xs dark:text-white outline-none"
                     autoFocus
                   />
                   <button 
                     onClick={() => updateSettings({ location: LOCATIONS[0] })}
                     className="px-2 bg-gray-200 dark:bg-gray-600 rounded-md text-gray-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-500"
                   >
                     ✕
                   </button>
                </div>
             ) : (
               <select value={location} onChange={(e) => updateSettings({ location: e.target.value })} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-xs dark:text-white outline-none">
                 {LOCATIONS.map(i => <option key={i} value={i}>{i}</option>)}
               </select>
             )}
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-semibold text-gray-500 uppercase">Waktu</label>
             <select value={time} onChange={(e) => updateSettings({ time: e.target.value })} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-xs dark:text-white outline-none">
               {TIMES.map(i => <option key={i} value={i}>{i}</option>)}
             </select>
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-semibold text-gray-500 uppercase">Angle</label>
             <select value={angle} onChange={(e) => updateSettings({ angle: e.target.value })} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-xs dark:text-white outline-none">
               {CAMERA_ANGLES.map(i => <option key={i} value={i}>{i}</option>)}
             </select>
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-semibold text-gray-500 uppercase">Pencahayaan</label>
             <select value={lighting} onChange={(e) => updateSettings({ lighting: e.target.value })} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-xs dark:text-white outline-none">
               {LIGHTING.map(i => <option key={i} value={i}>{i}</option>)}
             </select>
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-semibold text-gray-500 uppercase">Pose</label>
             {pose === 'manual_pose' ? (
                <div className="flex gap-2">
                   <input 
                     type="text"
                     value={customPose}
                     onChange={(e) => updateSettings({ customPose: e.target.value })}
                     placeholder="Pose..."
                     className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-xs dark:text-white outline-none"
                     autoFocus
                   />
                   <button 
                     onClick={() => updateSettings({ pose: 'auto' })}
                     className="px-2 bg-gray-200 dark:bg-gray-600 rounded-md text-gray-600 dark:text-gray-300 hover:bg-red-100 hover:text-red-500"
                   >
                     ✕
                   </button>
                </div>
             ) : (
               <select value={pose} onChange={(e) => updateSettings({ pose: e.target.value })} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-xs dark:text-white outline-none">
                 {POSE_OPTIONS.map((item, idx) => {
                    if ('options' in item && item.options) {
                        return (
                            <optgroup key={idx} label={item.label}>
                                {item.options.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </optgroup>
                        );
                    } else if ('value' in item) {
                        return <option key={item.value} value={item.value}>{item.label}</option>;
                    }
                    return null;
                 })}
               </select>
             )}
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-semibold text-gray-500 uppercase">Efek Visual</label>
             <select 
              value={visualEffect} 
              onChange={(e) => updateSettings({ visualEffect: e.target.value })} 
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-xs dark:text-white outline-none"
             >
               {VISUAL_EFFECT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
             </select>
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-semibold text-gray-500 uppercase">Makeup</label>
             <select 
              value={makeup} 
              onChange={(e) => updateSettings({ makeup: e.target.value })} 
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-2 text-xs dark:text-white outline-none"
             >
               {MAKEUP_STYLES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
             </select>
          </div>
       </div>

       <div className="space-y-1">
          <label className="text-[10px] font-semibold text-gray-500 uppercase">Senjata/Aksesoris (Opsional)</label>
          <input 
            type="text" 
            value={accessories}
            onChange={(e) => updateSettings({ accessories: e.target.value })}
            placeholder="Contoh: pedang katana, kunai, topi jerami, headset gaming..."
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent dark:bg-gray-700 p-3 text-sm dark:text-white outline-none focus:border-primary-500"
          />
       </div>
    </div>
  );

  return (
    <GeneratorModule 
      moduleId="cosplay-fusion"
      title="GeGe Cosplay"
      description="Wujudkan impianmu jadi karakter favorit! Cukup upload foto, AI kami akan urus detail kostumnya."
      promptPrefix={getPrompt()}
      customPromptLabel="Prompt (Auto/Edit)"
      
      requireImage={true}
      mainImageLabel="Wajah Utama (Wajib)"
      
      allowAdditionalFaceImage={true}
      secondFaceLabel="Wajah 2 / Partner (Opsional)"
      
      allowReferenceImage={true}
      referenceImageLabel="Referensi Kostum (Opsional)"
      
      extraControls={extraControls}
      batchModeAvailable={true}
      
      customPromptGenerator={handleGenerateCharPrompt}

      renderCustomResultActions={renderCustomResultActions}

      initialState={initialState?.generator}
      onStateChange={(state) => onStateChange?.({ ...initialState, generator: state })}
    />
  );
};