'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Language = 'en' | 'pt' | 'es'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, defaultValue?: string, variables?: Record<string, string>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export const translations: Record<Language, Record<string, string>> = {
  en: {
    'common.language': 'Language',
    'common.english': 'English',
    'common.portuguese': 'Portuguese',
    'common.spanish': 'Spanish',
    'common.star': 'Star',
    'common.star_github': 'Star on GitHub',
    'common.copied': 'Copied!',
    'common.copy_code': 'Copy Code',
    'common.saving': 'Saving...',
    'common.saved': 'Saved!',
    'common.error': 'Error!',
    'common.save_profile': 'Save Profile',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.finish': 'Finish',
    'common.step': 'Step',
    'common.of': 'of',
    'common.name': 'Name:',
    'common.role': 'Role:',
    'common.developer': 'Developer',
    'common.languages': 'Languages:',
    'common.stars': 'Stars:',
    'common.repos': 'Repos:',

    'landing.navbar.features': 'FEATURES',
    'landing.navbar.templates': 'TEMPLATES',
    'landing.navbar.how_it_works': 'HOW IT WORKS',
    'landing.navbar.faq': 'FAQ',

    'landing.hero.eyebrow': '[ THE FUTURE OF GITHUB PROFILES ]',
    'landing.hero.title_normal': 'Create ',
    'landing.hero.title_italic': 'Stunning',
    'landing.hero.title_end': ' GitHub Profile READMEs.',
    'landing.hero.subtitle':
      'Premium SVGs. ASCII art. Visual editor. One platform for developers who care about their profile.',
    'landing.hero.placeholder': 'Enter your GitHub username',
    'landing.hero.open_editor': 'Open Editor',
    'landing.hero.generate_best': 'Generate Best Profile',

    'landing.demo.eyebrow': '[ SEE IT IN ACTION ]',
    'landing.demo.title_normal': 'From Username to ',
    'landing.demo.title_italic': 'Masterpiece.',

    'landing.features.eyebrow': '[ WHY GITASCII ]',
    'landing.features.title_normal': 'Everything You ',
    'landing.features.title_italic': 'Need.',
    'landing.features.subtitle':
      'Everything you need to build, customize, and share beautiful GitHub profiles.',
    'landing.features.visual_editor.title': 'Visual Editor',
    'landing.features.visual_editor.desc':
      'Drag-and-drop editor inspired by Canva and Figma. See every change in real-time.',
    'landing.features.ascii_art.title': 'ASCII Art Engine',
    'landing.features.ascii_art.desc':
      'Convert any image to stunning ASCII art with 6+ character sets, adjustable density and color.',
    'landing.features.templates.title': 'Premium Templates',
    'landing.features.templates.desc':
      '13+ handcrafted templates. From Terminal to Cyberpunk. One-click apply, fully customizable.',
    'landing.features.live_rendering.title': 'Live Rendering',
    'landing.features.live_rendering.desc':
      'Your SVG is served via URL — always up to date. No manual uploads, no stale data.',
    'landing.features.multiple_profiles.title': 'Multiple Profiles',
    'landing.features.multiple_profiles.desc':
      'Create different profiles for different purposes. Portfolio, Resume, Open Source — all from one account.',
    'landing.features.smart_gen.title': 'Smart Generation',
    'landing.features.smart_gen.desc':
      'Let GitAscii analyze your GitHub and generate the perfect profile automatically.',

    'landing.how_it_works.eyebrow': '[ THREE STEPS ]',
    'landing.how_it_works.title_normal': 'Simple. ',
    'landing.how_it_works.title_italic': 'Powerful.',
    'landing.how_it_works.step1_title': 'Enter Your Username',
    'landing.how_it_works.step1_desc':
      'Just type your GitHub username. We fetch everything automatically.',
    'landing.how_it_works.step2_title': 'Customize Everything',
    'landing.how_it_works.step2_desc':
      'Use our visual editor to drag widgets, pick templates, and tune every detail. Or let us generate the best profile for you.',
    'landing.how_it_works.step3_title': 'Copy & Paste',
    'landing.how_it_works.step3_desc':
      'Copy one line of code to your README. Your profile SVG stays always up-to-date via our URL.',

    'landing.templates.badge': '[ 13 TEMPLATES ]',
    'landing.templates.eyebrow': '[ CHOOSE YOUR STYLE ]',
    'landing.templates.title_normal': 'Premium ',
    'landing.templates.title_italic': 'Templates.',
    'landing.templates.subtitle':
      '13+ beautifully crafted templates. Pick one, customize everything.',

    'landing.faq.eyebrow': '[ QUESTIONS & ANSWERS ]',
    'landing.faq.title_normal': 'Frequently Asked ',
    'landing.faq.title_italic': 'Questions.',
    'landing.faq.q1': 'What is GitAscii?',
    'landing.faq.a1':
      'GitAscii is a platform for creating premium GitHub Profile READMEs using customizable SVGs and a visual editor. Think of it as Canva for your GitHub profile.',
    'landing.faq.q2': 'Is GitAscii free?',
    'landing.faq.a2':
      'Yes! GitAscii is completely free and open source. We believe every developer deserves a beautiful profile.',
    'landing.faq.q3': 'How does the live SVG rendering work?',
    'landing.faq.a3':
      'Instead of uploading SVG files to GitHub, you embed a URL that points to our servers. We generate your SVG on-the-fly with your latest GitHub data, so your profile is always up to date.',
    'landing.faq.q4': 'What is ASCII Art conversion?',
    'landing.faq.a4':
      'Our ASCII Art Engine converts any image (like your GitHub avatar) into stunning character-based art using configurable character sets, density, and color options.',
    'landing.faq.q5': 'Can I have multiple profile layouts?',
    'landing.faq.a5':
      'Absolutely! Each user can create multiple named profiles (e.g., Portfolio, Terminal, Resume) with different templates and configurations.',
    'landing.faq.q6': 'Does it support dark and light mode?',
    'landing.faq.a6':
      "Yes. GitAscii generates separate SVGs for dark and light themes. Using the HTML picture element, GitHub automatically shows the right version based on the viewer's preference.",
    'landing.faq.q7': 'What is Generate Best Profile?',
    'landing.faq.a7':
      'Our smart generation feature analyzes your GitHub data (repos, languages, contributions, bio) and automatically creates an optimized profile layout tailored to your activity.',
    'landing.faq.q8': 'Can I customize everything?',
    'landing.faq.a8':
      'Yes. While templates give you a great starting point, every single widget property (colors, fonts, sizes, positions) can be customized in the visual editor.',

    'landing.footer.eyebrow': '[ GET STARTED TODAY ]',
    'landing.footer.title_normal': 'Ready to Transform Your ',
    'landing.footer.title_italic': 'Profile?',
    'landing.footer.subtitle':
      'Join developers who already elevated their GitHub presence with stunning ASCII art and premium SVGs.',
    'landing.footer.start_building': 'Start Building',
    'landing.footer.description':
      'Transform your GitHub contributions into stunning ASCII art. Premium SVGs and a visual editor for developers.',
    'landing.footer.product': '[ PRODUCT ]',
    'landing.footer.resources': '[ RESOURCES ]',
    'landing.footer.community': '[ COMMUNITY ]',
    'landing.footer.item.features': 'Features',
    'landing.footer.item.templates': 'Templates',
    'landing.footer.item.editor': 'Editor',
    'landing.footer.item.generate': 'Generate',
    'landing.footer.item.documentation': 'Documentation',
    'landing.footer.item.api': 'API',
    'landing.footer.item.changelog': 'Changelog',
    'landing.footer.item.status': 'Status',
    'landing.footer.item.github': 'GitHub',
    'landing.footer.item.contributing': 'Contributing',
    'landing.footer.item.discussions': 'Discussions',

    'editor.fetching_data': '[ FETCHING GITHUB DATA ]',
    'editor.error_fetching': '[ ERROR ]',
    'editor.return_home': 'Return to Home',
    'editor.sidebar.widgets': 'Widgets',
    'editor.sidebar.templates': 'Templates',
    'editor.sidebar.search_placeholder': 'Search widgets...',
    'editor.sidebar.no_widgets': 'No widgets found for "{query}"',
    'editor.sidebar.portability': '[ PORTABILITY ]',
    'editor.sidebar.import_layout': 'Import Layout',
    'editor.sidebar.import_layout_desc': 'Load layout from JSON file',
    'editor.sidebar.export_layout': 'Export Layout',
    'editor.sidebar.export_layout_desc': 'Save current layout as JSON file',
    'editor.sidebar.preset_templates': '[ PRESET TEMPLATES ]',
    'editor.sidebar.templates_desc':
      'Switching templates updates colors and layout while preserving your GitHub data.',
    'editor.sidebar.active': 'Active',
    'editor.sidebar.filter.all': 'All',
    'editor.sidebar.filter.popular': 'Featured',
    'editor.sidebar.filter.essential': 'Essential',
    'editor.sidebar.filter.external': 'External',
    'editor.sidebar.featured_widgets': '[ FEATURED WIDGETS ]',
    'editor.sidebar.featured_slot': 'Available Slot',
    'editor.sidebar.announce': 'Advertise Here',
    'editor.sidebar.featured_slot_desc': 'Highlight your widget to the community',
    'editor.sidebar.contribute_widget': 'Add your own Widget!',
    'editor.sidebar.contribute_widget_desc': 'Fork and contribute to the community',
    'editor.sidebar.contribute_template': 'Create your own Template!',
    'editor.sidebar.contribute_template_desc': 'Fork and share with the community',
    'editor.sidebar.preview': 'PREVIEW',
    'editor.sidebar.insert': 'Insert',

    'editor.guide.copied_title': 'Code copied!',
    'editor.guide.copied_subtitle': 'Follow the steps to add it to your profile',
    'editor.guide.dont_show_again': "Don't show this guide again",
    'editor.guide.step1_title': 'Edit README.md',
    'editor.guide.step1_desc':
      'Open your special repository (username/username) on GitHub, click on README.md and then click the edit pencil icon [icon] to modify it.',
    'editor.guide.step1_link': 'Edit README',
    'editor.guide.step2_title': 'Paste the code',
    'editor.guide.step2_desc':
      'Paste the copied code (Ctrl+V / ⌘+V) in the desired location in your README.',
    'editor.guide.step2_recopy': 'Copy again',
    'editor.guide.step3_title': 'Save and check',
    'editor.guide.step3_desc':
      'Click "Commit changes" to save. Then, visit your profile to see the result!',
    'editor.guide.step3_link': 'View my profile',

    'widget.badge.mais_usado': 'Most Used',
    'widget.badge.destaque': 'Featured',
    'widget.badge.essencial': 'Essential',
    'widget.badge.interativo': 'Interactive',
    'widget.badge.popular': 'Popular',
    'widget.badge.trending': 'Trending',

    'widget.catalog.header.name': 'Header',
    'widget.catalog.header.desc': 'Name, handle & company badge',
    'widget.catalog.ascii-text.name': 'ASCII Text',
    'widget.catalog.ascii-text.desc': 'Custom text rendered in ASCII art font',
    'widget.catalog.ascii-art.name': 'ASCII Art',
    'widget.catalog.ascii-art.desc': 'Image converted to character art',
    'editor.ascii.text_title': 'ASCII Text',
    'editor.ascii.text_label': 'Custom Text',
    'editor.ascii.font_label': 'ASCII Font Style',
    'editor.ascii.charset_base_label': 'Base Charset',
    'editor.ascii.spacing_label': 'Letter Spacing',
    'editor.ascii.fontsize_label': 'Character Size',
    'editor.ascii.font.block': 'Block Solid',
    'editor.ascii.font.slant': 'Slant Banner',
    'editor.ascii.font.thin': 'Thin Outline',
    'widget.catalog.terminal-info.name': 'Terminal Info',
    'widget.catalog.terminal-info.desc': 'Neofetch-style terminal info card',
    'widget.catalog.avatar.name': 'Avatar',
    'widget.catalog.avatar.desc': 'Profile picture frame',
    'widget.catalog.tech-stack.name': 'Tech Stack',
    'widget.catalog.tech-stack.desc': 'Interactive skill icons gallery',
    'widget.catalog.bio.name': 'Bio & Links',
    'widget.catalog.bio.desc': 'Biography, location & blog link',
    'widget.catalog.stats.name': 'GitHub Stats',
    'widget.catalog.stats.desc': 'Stars, repos, followers metrics',
    'widget.catalog.languages.name': 'Top Languages',
    'widget.catalog.languages.desc': 'Language breakdown bar',
    'widget.catalog.repositories.name': 'Featured Repos',
    'widget.catalog.repositories.desc': 'Highlighted repository cards',
    'widget.catalog.social-media.name': 'Social Media',
    'widget.catalog.social-media.desc': 'Shields & social media badges',
    'widget.catalog.github-readme-stats.name': 'GitHub Readme Stats',
    'widget.catalog.github-readme-stats.desc': 'Estatísticas, top linguagens & repos fixados',
    'widget.catalog.streak-stats.name': 'GitHub Streak Stats',
    'widget.catalog.streak-stats.desc': 'Sequência e recorde de contribuições',
    'widget.catalog.profile-trophy.name': 'GitHub Profile Trophy',
    'widget.catalog.profile-trophy.desc': 'Troféus e conquistas do perfil',
    'widget.catalog.activity-graph.name': 'Activity Graph',
    'widget.catalog.activity-graph.desc': 'Gráfico de linhas de atividade em 31 dias',
    'widget.catalog.contribution-snake.name': 'Contribution Snake',
    'widget.catalog.contribution-snake.desc': 'Cobra animada comendo os blocos de commit',
    'widget.catalog.metrics-card.name': 'Metrics Card',
    'widget.catalog.metrics-card.desc': 'Infográfico avançado de métricas e hábitos',
    'widget.catalog.views-counter.name': 'Profile Views Counter',
    'widget.catalog.views-counter.desc': 'Contador de visitas ao perfil GitHub',
    'widget.catalog.readme-quotes.name': 'GitHub Readme Quotes',
    'widget.catalog.readme-quotes.desc': 'Citação diária para desenvolvedores',
    'widget.catalog.awesome-badge.name': 'Awesome Profile Badge',
    'widget.catalog.awesome-badge.desc': 'Badge de destaque para perfis incríveis',
    'widget.catalog.divider.name': 'Neon Divider',
    'widget.catalog.divider.desc': 'Section separator line',
    'widget.catalog.footer.name': 'Footer Stamp',
    'widget.catalog.footer.desc': 'Signature metadata footer',
  },
  pt: {
    'common.language': 'Idioma',
    'common.english': 'Inglês',
    'common.portuguese': 'Português',
    'common.spanish': 'Espanhol',
    'common.star': 'Favoritar',
    'common.star_github': 'Star no GitHub',
    'common.copied': 'Copiado!',
    'common.copy_code': 'Copiar Código',
    'common.saving': 'Salvando...',
    'common.saved': 'Salvo!',
    'common.error': 'Erro!',
    'common.save_profile': 'Salvar Perfil',
    'common.close': 'Fechar',
    'common.back': 'Voltar',
    'common.next': 'Próximo',
    'common.finish': 'Concluir',
    'common.step': 'Passo',
    'common.of': 'de',
    'common.name': 'Nome:',
    'common.role': 'Cargo:',
    'common.developer': 'Desenvolvedor',
    'common.languages': 'Linguagens:',
    'common.stars': 'Estrelas:',
    'common.repos': 'Repos:',

    'landing.navbar.features': 'RECURSOS',
    'landing.navbar.templates': 'TEMPLATES',
    'landing.navbar.how_it_works': 'COMO FUNCIONA',
    'landing.navbar.faq': 'FAQ',

    'landing.hero.eyebrow': '[ O FUTURO DOS PERFIS DO GITHUB ]',
    'landing.hero.title_normal': 'Crie READMEs ',
    'landing.hero.title_italic': 'Incríveis',
    'landing.hero.title_end': ' para seu Perfil do GitHub.',
    'landing.hero.subtitle':
      'SVGs Premium. Arte ASCII. Editor visual. Uma única plataforma para desenvolvedores que se importam com o seu perfil.',
    'landing.hero.placeholder': 'Digite seu nome de usuário do GitHub',
    'landing.hero.open_editor': 'Abrir Editor',
    'landing.hero.generate_best': 'Gerar Melhor Perfil',

    'landing.demo.eyebrow': '[ VEJA EM AÇÃO ]',
    'landing.demo.title_normal': 'De Usuário a ',
    'landing.demo.title_italic': 'Obra de Arte.',

    'landing.features.eyebrow': '[ POR QUE O GITASCII ]',
    'landing.features.title_normal': 'Tudo que Você ',
    'landing.features.title_italic': 'Precisa.',
    'landing.features.subtitle':
      'Tudo o que você precisa para construir, personalizar e compartilhar lindos perfis do GitHub.',
    'landing.features.visual_editor.title': 'Editor Visual',
    'landing.features.visual_editor.desc':
      'Editor de arrastar e soltar inspirado no Canva e Figma. Veja cada alteração em tempo real.',
    'landing.features.ascii_art.title': 'Motor de Arte ASCII',
    'landing.features.ascii_art.desc':
      'Converta qualquer imagem em arte ASCII impressionante com mais de 6 conjuntos de caracteres, densidade e cor ajustáveis.',
    'landing.features.templates.title': 'Templates Premium',
    'landing.features.templates.desc':
      'Mais de 13 templates artesanais. Do Terminal ao Cyberpunk. Aplicação em um clique, totalmente personalizável.',
    'landing.features.live_rendering.title': 'Renderização ao Vivo',
    'landing.features.live_rendering.desc':
      'Seu SVG é servido via URL — sempre atualizado. Sem uploads manuais, sem dados desatualizados.',
    'landing.features.multiple_profiles.title': 'Múltiplos Perfis',
    'landing.features.multiple_profiles.desc':
      'Crie perfis diferentes para finalidades distintas. Portfólio, Currículo, Open Source — tudo a partir de uma conta.',
    'landing.features.smart_gen.title': 'Geração Inteligente',
    'landing.features.smart_gen.desc':
      'Deixe o GitAscii analisar seu GitHub e gerar o perfil perfeito de forma automática.',

    'landing.how_it_works.eyebrow': '[ TRÊS PASSOS ]',
    'landing.how_it_works.title_normal': 'Simples. ',
    'landing.how_it_works.title_italic': 'Poderoso.',
    'landing.how_it_works.step1_title': 'Digite seu Usuário',
    'landing.how_it_works.step1_desc':
      'Basta digitar seu nome de usuário do GitHub. Nós buscamos tudo automaticamente.',
    'landing.how_it_works.step2_title': 'Personalize Tudo',
    'landing.how_it_works.step2_desc':
      'Use nosso editor visual para arrastar widgets, escolher templates e ajustar cada detalhe. Or let us generate the best profile for you.',
    'landing.how_it_works.step3_title': 'Copie e Cole',
    'landing.how_it_works.step3_desc':
      'Copie uma linha de código para seu README. O SVG do seu perfil se mantém sempre atualizado pela nossa URL.',

    'landing.templates.badge': '[ 13 TEMPLATES ]',
    'landing.templates.eyebrow': '[ ESCOLHA SEU ESTILO ]',
    'landing.templates.title_normal': 'Templates ',
    'landing.templates.title_italic': 'Premium.',
    'landing.templates.subtitle':
      'Mais de 13 templates lindamente desenhados. Escolha um e personalize tudo.',

    'landing.faq.eyebrow': '[ PERGUNTAS E RESPOSTAS ]',
    'landing.faq.title_normal': 'Perguntas ',
    'landing.faq.title_italic': 'Frequentes.',
    'landing.faq.q1': 'O que é o GitAscii?',
    'landing.faq.a1':
      'O GitAscii é uma plataforma para criar READMEs premium para o perfil do GitHub usando SVGs personalizáveis e um editor visual. Pense nele como o Canva para o seu perfil do GitHub.',
    'landing.faq.q2': 'O GitAscii é gratuito?',
    'landing.faq.a2':
      'Sim! O GitAscii é totalmente gratuito e de código aberto. Acreditamos que todo desenvolvedor merece um perfil bonito.',
    'landing.faq.q3': 'Como funciona a renderização dinâmica de SVG?',
    'landing.faq.a3':
      'Em vez de fazer o upload de arquivos SVG no GitHub, você incorpora uma URL que aponta para os nossos servidores. Nós geramos seu SVG dinamicamente com seus dados mais recentes do GitHub, para que seu perfil esteja sempre atualizado.',
    'landing.faq.q4': 'O que é a conversão de arte ASCII?',
    'landing.faq.a4':
      'Nosso motor de arte ASCII converte qualquer imagem (como seu avatar do GitHub) em uma impressionante arte baseada em caracteres usando conjuntos de caracteres, densidade e opções de cores configuráveis.',
    'landing.faq.q5': 'Posso ter múltiplos layouts de perfil?',
    'landing.faq.a5':
      'Com certeza! Cada usuário pode criar múltiplos perfis nomeados (ex: Portfólio, Terminal, Currículo) com diferentes templates e configurações.',
    'landing.faq.q6': 'Suporta modo claro e escuro?',
    'landing.faq.a6':
      'Sim. O GitAscii gera SVGs separados para os temas escuro e claro. Usando o elemento HTML picture, o GitHub exibe automaticamente a versão correta com base na preferência do visitante.',
    'landing.faq.q7': 'O que é o "Gerar Melhor Perfil"?',
    'landing.faq.a7':
      'Nosso recurso de geração inteligente analisa seus dados do GitHub (repositórios, linguagens, contribuições, biografia) e cria automaticamente um layout de perfil otimizado e sob medida para sua atividade.',
    'landing.faq.q8': 'Posso personalizar tudo?',
    'landing.faq.a8':
      'Sim. Embora os templates ofereçam um excelente ponto de partida, todas as propriedades de cada widget (cores, fontes, tamanhos, posições) podem ser personalizadas no editor visual.',

    'landing.footer.eyebrow': '[ COMECE HOJE MESMO ]',
    'landing.footer.title_normal': 'Pronto para Transformar seu ',
    'landing.footer.title_italic': 'Perfil?',
    'landing.footer.subtitle':
      'Junte-se a desenvolvedores que já elevaram sua presença no GitHub com artes ASCII incríveis e SVGs premium.',
    'landing.footer.start_building': 'Começar a Criar',
    'landing.footer.description':
      'Transforme suas contribuições do GitHub em artes ASCII impressionantes. SVGs premium e editor visual para desenvolvedores.',
    'landing.footer.product': '[ PRODUTO ]',
    'landing.footer.resources': '[ RECURSOS ]',
    'landing.footer.community': '[ COMUNIDADE ]',
    'landing.footer.item.features': 'Recursos',
    'landing.footer.item.templates': 'Templates',
    'landing.footer.item.editor': 'Editor',
    'landing.footer.item.generate': 'Gerar',
    'landing.footer.item.documentation': 'Documentação',
    'landing.footer.item.api': 'API',
    'landing.footer.item.changelog': 'Notas de Versão',
    'landing.footer.item.status': 'Status',
    'landing.footer.item.github': 'GitHub',
    'landing.footer.item.contributing': 'Contribuir',
    'landing.footer.item.discussions': 'Discussões',

    'editor.fetching_data': '[ BUSCANDO DADOS DO GITHUB ]',
    'editor.error_fetching': '[ ERRO ]',
    'editor.return_home': 'Voltar para Home',
    'editor.sidebar.widgets': 'Widgets',
    'editor.sidebar.templates': 'Templates',
    'editor.sidebar.search_placeholder': 'Buscar widget...',
    'editor.sidebar.no_widgets': 'Nenhum widget encontrado para "{query}"',
    'editor.sidebar.portability': '[ PORTABILIDADE ]',
    'editor.sidebar.import_layout': 'Importar Layout',
    'editor.sidebar.import_layout_desc': 'Carregar layout de arquivo JSON',
    'editor.sidebar.export_layout': 'Exportar Layout',
    'editor.sidebar.export_layout_desc': 'Salvar layout atual em arquivo JSON',
    'editor.sidebar.preset_templates': '[ TEMPLATES PADRÃO ]',
    'editor.sidebar.templates_desc':
      'Alterar templates atualiza as cores e layout preservando seus dados do GitHub.',
    'editor.sidebar.active': 'Ativo',
    'editor.sidebar.filter.all': 'Todos',
    'editor.sidebar.filter.popular': 'Destaques',
    'editor.sidebar.filter.essential': 'Essenciais',
    'editor.sidebar.filter.external': 'Externos',
    'editor.sidebar.featured_widgets': '[ WIDGETS EM DESTAQUE ]',
    'editor.sidebar.featured_slot': 'Espaço Disponível',
    'editor.sidebar.announce': 'Anuncie Aqui',
    'editor.sidebar.featured_slot_desc': 'Destaque seu widget para a comunidade',
    'editor.sidebar.contribute_widget': 'Adicione seu próprio Widget!',
    'editor.sidebar.contribute_widget_desc': 'Faça um fork e contribua com a comunidade',
    'editor.sidebar.contribute_template': 'Crie seu próprio Template!',
    'editor.sidebar.contribute_template_desc': 'Faça um fork e compartilhe com a comunidade',
    'editor.sidebar.preview': 'PREVISÃO',
    'editor.sidebar.insert': 'Inserir',

    'editor.guide.copied_title': 'Código copiado!',
    'editor.guide.copied_subtitle': 'Siga os passos para adicionar ao seu perfil',
    'editor.guide.dont_show_again': 'Não mostrar este guia novamente',
    'editor.guide.step1_title': 'Edite o README.md',
    'editor.guide.step1_desc':
      'Abra o seu repositório especial (username/username) no GitHub, clique no arquivo README.md e depois no ícone de editar [icon] para modificá-lo.',
    'editor.guide.step1_link': 'Editar README',
    'editor.guide.step2_title': 'Cole o código',
    'editor.guide.step2_desc':
      'Cole o código copiado (Ctrl+V / ⌘+V) no local desejado do seu README.',
    'editor.guide.step2_recopy': 'Copiar novamente',
    'editor.guide.step3_title': 'Salve e confira',
    'editor.guide.step3_desc':
      'Clique em "Commit changes" para salvar. Depois, acesse seu perfil para ver o resultado!',
    'editor.guide.step3_link': 'Ver meu perfil',

    'widget.badge.mais_usado': 'Mais Usado',
    'widget.badge.destaque': 'Destaque',
    'widget.badge.essencial': 'Essencial',
    'widget.badge.interativo': 'Interativo',
    'widget.badge.popular': 'Popular',
    'widget.badge.trending': 'Popular',

    'widget.catalog.header.name': 'Cabeçalho',
    'widget.catalog.header.desc': 'Nome, usuário & badge da empresa',
    'widget.catalog.ascii-text.name': 'Texto ASCII',
    'widget.catalog.ascii-text.desc': 'Texto personalizado renderizado em fonte de arte ASCII',
    'widget.catalog.ascii-art.name': 'Arte ASCII',
    'widget.catalog.ascii-art.desc': 'Imagem convertida em arte de caracteres',
    'editor.ascii.text_title': 'Texto em ASCII',
    'editor.ascii.text_label': 'Texto Personalizado',
    'editor.ascii.font_label': 'Estilo da Fonte ASCII',
    'editor.ascii.charset_base_label': 'Conjunto de Caracteres (Base)',
    'editor.ascii.spacing_label': 'Espaçamento de Letras',
    'editor.ascii.fontsize_label': 'Tamanho do Caractere',
    'editor.ascii.font.block': 'Bloco Sólido',
    'editor.ascii.font.slant': 'Slant Inclinado',
    'editor.ascii.font.thin': 'Linha Fina',
    'widget.catalog.terminal-info.name': 'Informações do Terminal',
    'widget.catalog.terminal-info.desc': 'Cartão estilo Neofetch com infos do terminal',
    'widget.catalog.avatar.name': 'Avatar',
    'widget.catalog.avatar.desc': 'Moldura para foto de perfil',
    'widget.catalog.tech-stack.name': 'Habilidades',
    'widget.catalog.tech-stack.desc': 'Galeria interativa de ícones de habilidades',
    'widget.catalog.bio.name': 'Biografia & Links',
    'widget.catalog.bio.desc': 'Biografia, localização & link do site',
    'widget.catalog.stats.name': 'Estatísticas do GitHub',
    'widget.catalog.stats.desc': 'Métricas de estrelas, repositórios e seguidores',
    'widget.catalog.languages.name': 'Principais Linguagens',
    'widget.catalog.languages.desc': 'Barra de detalhamento de linguagens',
    'widget.catalog.repositories.name': 'Repositórios em Destaque',
    'widget.catalog.repositories.desc': 'Cartões de repositórios destacados',
    'widget.catalog.social-media.name': 'Redes Sociais',
    'widget.catalog.social-media.desc': 'Escudos e badges de redes sociais',
    'widget.catalog.github-readme-stats.name': 'Estatísticas GitHub (Readme Stats)',
    'widget.catalog.github-readme-stats.desc':
      'Estatísticas, top linguagens e repositórios fixados',
    'widget.catalog.streak-stats.name': 'Sequência GitHub (Streak Stats)',
    'widget.catalog.streak-stats.desc': 'Sequência e recorde de contribuições',
    'widget.catalog.profile-trophy.name': 'Troféus GitHub (Profile Trophy)',
    'widget.catalog.profile-trophy.desc': 'Troféus e conquistas do perfil',
    'widget.catalog.activity-graph.name': 'Gráfico de Atividade (Activity Graph)',
    'widget.catalog.activity-graph.desc': 'Gráfico de linhas de atividade em 31 dias',
    'widget.catalog.contribution-snake.name': 'Cobra do Histórico (Contribution Snake)',
    'widget.catalog.contribution-snake.desc': 'Cobra animada comendo blocos de commit',
    'widget.catalog.metrics-card.name': 'Cartão de Métricas (Metrics Card)',
    'widget.catalog.metrics-card.desc': 'Infográfico avançado de métricas e hábitos',
    'widget.catalog.views-counter.name': 'Contador de Visitas',
    'widget.catalog.views-counter.desc': 'Contador de visitas ao perfil do GitHub',
    'widget.catalog.readme-quotes.name': 'Citações GitHub (Readme Quotes)',
    'widget.catalog.readme-quotes.desc': 'Citação diária para desenvolvedores',
    'widget.catalog.awesome-badge.name': 'Badge Destaque (Awesome Profile)',
    'widget.catalog.awesome-badge.desc': 'Badge de destaque para perfis incríveis',
    'widget.catalog.divider.name': 'Divisor Neon',
    'widget.catalog.divider.desc': 'Linha de separação de seções',
    'widget.catalog.footer.name': 'Selo de Rodapé',
    'widget.catalog.footer.desc': 'Rodapé de metadados com assinatura',
  },
  es: {
    'common.language': 'Idioma',
    'common.english': 'Inglés',
    'common.portuguese': 'Portugués',
    'common.spanish': 'Español',
    'common.star': 'Destacar',
    'common.star_github': 'Star en GitHub',
    'common.copied': '¡Copiado!',
    'common.copy_code': 'Copiar Código',
    'common.saving': 'Guardando...',
    'common.saved': '¡Guardado!',
    'common.error': '¡Error!',
    'common.save_profile': 'Guardar Perfil',
    'common.close': 'Cerrar',
    'common.back': 'Volver',
    'common.next': 'Siguiente',
    'common.finish': 'Finalizar',
    'common.step': 'Paso',
    'common.of': 'de',
    'common.name': 'Nombre:',
    'common.role': 'Rol:',
    'common.developer': 'Desarrollador',
    'common.languages': 'Lenguajes:',
    'common.stars': 'Estrellas:',
    'common.repos': 'Repos:',

    'landing.navbar.features': 'CARACTERÍSTICAS',
    'landing.navbar.templates': 'PLANTILLAS',
    'landing.navbar.how_it_works': 'CÓMO FUNCIONA',
    'landing.navbar.faq': 'FAQ',

    'landing.hero.eyebrow': '[ EL FUTURO DE LOS PERFILES DE GITHUB ]',
    'landing.hero.title_normal': 'Crea READMEs ',
    'landing.hero.title_italic': 'Impresionantes',
    'landing.hero.title_end': ' para tu Perfil de GitHub.',
    'landing.hero.subtitle':
      'SVGs Premium. Arte ASCII. Editor visual. Una única plataforma para desarrolladores que se preocupan por su perfil.',
    'landing.hero.placeholder': 'Ingresa tu usuario de GitHub',
    'landing.hero.open_editor': 'Abrir Editor',
    'landing.hero.generate_best': 'Generar Mejor Perfil',

    'landing.demo.eyebrow': '[ VER EN ACCIÓN ]',
    'landing.demo.title_normal': 'De Usuario a ',
    'landing.demo.title_italic': 'Obra de Arte.',

    'landing.features.eyebrow': '[ POR QUÉ GITASCII ]',
    'landing.features.title_normal': 'Todo lo que ',
    'landing.features.title_italic': 'Necesitas.',
    'landing.features.subtitle':
      'Todo lo que necesitas para construir, personalizar y compartir hermosos perfiles de GitHub.',
    'landing.features.visual_editor.title': 'Editor Visual',
    'landing.features.visual_editor.desc':
      'Editor de arrastrar y soltar inspirado en Canva y Figma. Mira cada cambio en tiempo real.',
    'landing.features.ascii_art.title': 'Motor de Arte ASCII',
    'landing.features.ascii_art.desc':
      'Convierte cualquier imagen en arte ASCII impresionante con más de 6 conjuntos de caracteres, densidad y color ajustables.',
    'landing.features.templates.title': 'Plantillas Premium',
    'landing.features.templates.desc':
      'Más de 13 plantillas artesanales. Desde Terminal hasta Cyberpunk. Aplicación con un clic, totalmente ajustable.',
    'landing.features.live_rendering.title': 'Renderizado en Vivo',
    'landing.features.live_rendering.desc':
      'Tu SVG se sirve a través de una URL, siempre actualizado. Sin subidas manuales, sin datos obsoletos.',
    'landing.features.multiple_profiles.title': 'Múltiples Perfiles',
    'landing.features.multiple_profiles.desc':
      'Crea diferentes perfiles para diferentes propósitos. Portafolio, Currículum, Open Source — todo desde una cuenta.',
    'landing.features.smart_gen.title': 'Generación Inteligente',
    'landing.features.smart_gen.desc':
      'Deja que GitAscii analice tu GitHub y genere el perfil perfecto automáticamente.',

    'landing.how_it_works.eyebrow': '[ TRES PASOS ]',
    'landing.how_it_works.title_normal': 'Simple. ',
    'landing.how_it_works.title_italic': 'Poderoso.',
    'landing.how_it_works.step1_title': 'Ingresa tu Usuario',
    'landing.how_it_works.step1_desc':
      'Solo escribe tu usuario de GitHub. Nosotros obtenemos todo automáticamente.',
    'landing.how_it_works.step2_title': 'Personaliza Todo',
    'landing.how_it_works.step2_desc':
      'Usa nuestro editor visual para arrastrar widgets, elegir plantillas y ajustar cada detalle. O déjanos generar el mejor perfil para ti.',
    'landing.how_it_works.step3_title': 'Copia y Pega',
    'landing.how_it_works.step3_desc':
      'Copia una línea de código en tu README. El SVG de tu perfil se mantiene siempre actualizado por nuestra URL.',

    'landing.templates.badge': '[ 13 PLANTILLAS ]',
    'landing.templates.eyebrow': '[ ELIGE TU ESTILO ]',
    'landing.templates.title_normal': 'Plantillas ',
    'landing.templates.title_italic': 'Premium.',
    'landing.templates.subtitle':
      'Más de 13 plantillas hermosamente diseñadas. Elige una y personaliza todo.',

    'landing.faq.eyebrow': '[ PREGUNTAS Y RESPUESTAS ]',
    'landing.faq.title_normal': 'Preguntas ',
    'landing.faq.title_italic': 'Frecuentes.',
    'landing.faq.q1': '¿Qué es GitAscii?',
    'landing.faq.a1':
      'GitAscii es una plataforma para crear READMEs premium para tu perfil de GitHub utilizando SVGs personalizables y un editor visual. Piensa en ello como Canva para tu perfil de GitHub.',
    'landing.faq.q2': '¿Es GitAscii gratis?',
    'landing.faq.a2':
      '¡Sí! GitAscii es completamente gratis y de código abierto. Creemos que cada desarrollador merece un perfil hermoso.',
    'landing.faq.q3': '¿Cómo funciona el renderizado dinámico de SVG?',
    'landing.faq.a3':
      'En lugar de subir archivos SVG a GitHub, insertas una URL que apunta a nuestros servidores. Generamos tu SVG al instante con tus datos más recientes de GitHub, por lo que tu perfil siempre está actualizado.',
    'landing.faq.q4': '¿Qué es la conversión de arte ASCII?',
    'landing.faq.a4':
      'Nuestro motor de arte ASCII convierte cualquier imagen (como tu avatar de GitHub) en un impresionante arte basado en caracteres mediante conjuntos de caracteres, densidad y opciones de color configurables.',
    'landing.faq.q5': '¿Puedo tener varios diseños de perfil?',
    'landing.faq.a5':
      '¡Absolutamente! Cada usuario puede crear múltiples perfiles con nombre (por ejemplo, Portafolio, Terminal, Currículum) con diferentes plantillas y configuraciones.',
    'landing.faq.q6': '¿Soporta modo oscuro y claro?',
    'landing.faq.a6':
      'Sí. GitAscii genera SVGs independientes para temas oscuros y claros. Utilizando el elemento HTML picture, GitHub muestra automáticamente la versión correcta según la preferencia del visitante.',
    'landing.faq.q7': '¿Qué es "Generar Mejor Perfil"?',
    'landing.faq.a7':
      'Nuestra función de generación inteligente analiza tus datos de GitHub (repos, lenguajes, contribuciones, bio) y crea automáticamente un diseño de perfil optimizado y adaptado a tu actividad.',
    'landing.faq.q8': '¿Puedo personalizar todo?',
    'landing.faq.a8':
      'Sí. Aunque las plantillas te ofrecen un excelente punto de partida, cada propiedad de los widgets (colores, fuentes, tamaños, posiciones) se puede personalizar en el editor visual.',

    'landing.footer.eyebrow': '[ EMPIEZA HOY MISMO ]',
    'landing.footer.title_normal': '¿Listo para Transformar tu ',
    'landing.footer.title_italic': 'Perfil?',
    'landing.footer.subtitle':
      'Únete a los desarrolladores que ya han mejorado su presencia en GitHub con increíble arte ASCII y SVGs premium.',
    'landing.footer.start_building': 'Comenzar a Crear',
    'landing.footer.description':
      'Transforma tus contribuciones de GitHub en impresionante arte ASCII. SVGs premium y editor visual para desarrolladores.',
    'landing.footer.product': '[ PRODUCTO ]',
    'landing.footer.resources': '[ RECURSOS ]',
    'landing.footer.community': '[ COMUNIDAD ]',
    'landing.footer.item.features': 'Características',
    'landing.footer.item.templates': 'Plantillas',
    'landing.footer.item.editor': 'Editor',
    'landing.footer.item.generate': 'Generar',
    'landing.footer.item.documentation': 'Documentación',
    'landing.footer.item.api': 'API',
    'landing.footer.item.changelog': 'Notas de Versión',
    'landing.footer.item.status': 'Estado',
    'landing.footer.item.github': 'GitHub',
    'landing.footer.item.contributing': 'Contribuir',
    'landing.footer.item.discussions': 'Discusiones',

    'editor.fetching_data': '[ OBTENIENDO DATOS DE GITHUB ]',
    'editor.error_fetching': '[ ERROR ]',
    'editor.return_home': 'Volver al Inicio',
    'editor.sidebar.widgets': 'Widgets',
    'editor.sidebar.templates': 'Plantillas',
    'editor.sidebar.search_placeholder': 'Buscar widget...',
    'editor.sidebar.no_widgets': 'Ningún widget encontrado para "{query}"',
    'editor.sidebar.portability': '[ PORTABILIDAD ]',
    'editor.sidebar.import_layout': 'Importar Diseño',
    'editor.sidebar.import_layout_desc': 'Cargar diseño desde archivo JSON',
    'editor.sidebar.export_layout': 'Exportar Diseño',
    'editor.sidebar.export_layout_desc': 'Guardar diseño actual como archivo JSON',
    'editor.sidebar.preset_templates': '[ PLANTILLAS PREDEFINIDAS ]',
    'editor.sidebar.templates_desc':
      'Cambiar plantillas actualiza los colores y el diseño conservando tus datos de GitHub.',
    'editor.sidebar.active': 'Activo',
    'editor.sidebar.filter.all': 'Todos',
    'editor.sidebar.filter.popular': 'Destacados',
    'editor.sidebar.filter.essential': 'Esenciales',
    'editor.sidebar.filter.external': 'Externos',
    'editor.sidebar.featured_widgets': '[ WIDGETS DESTACADOS ]',
    'editor.sidebar.featured_slot': 'Espacio Disponible',
    'editor.sidebar.announce': 'Anuncia Aquí',
    'editor.sidebar.featured_slot_desc': 'Destaca tu widget para la comunidad',
    'editor.sidebar.contribute_widget': '¡Añade tu propio Widget!',
    'editor.sidebar.contribute_widget_desc': 'Haz un fork y contribuye con la comunidad',
    'editor.sidebar.contribute_template': '¡Crea tu propia Plantilla!',
    'editor.sidebar.contribute_template_desc': 'Haz un fork y comparte con la comunidad',
    'editor.sidebar.preview': 'VISTA PREVIA',
    'editor.sidebar.insert': 'Insertar',

    'editor.guide.copied_title': '¡Código copiado!',
    'editor.guide.copied_subtitle': 'Sigue los pasos para agregarlo a tu perfil',
    'editor.guide.dont_show_again': 'No volver a mostrar esta guía',
    'editor.guide.step1_title': 'Edita el README.md',
    'editor.guide.step1_desc':
      'Abre tu repositorio especial (username/username) en GitHub, haz clic en el archivo README.md y luego en el icono de lápiz [icon] para editarlo.',
    'editor.guide.step1_link': 'Editar README',
    'editor.guide.step2_title': 'Pega el código',
    'editor.guide.step2_desc':
      'Pega el código copiado (Ctrl+V / ⌘+V) en el lugar deseado de tu README.',
    'editor.guide.step2_recopy': 'Copiar de nuevo',
    'editor.guide.step3_title': 'Guarda y revisa',
    'editor.guide.step3_desc':
      'Haz clic en "Commit changes" para guardar. ¡Luego, visita tu perfil para ver el resultado!',
    'editor.guide.step3_link': 'Ver mi perfil',

    'widget.badge.mais_usado': 'Más Usado',
    'widget.badge.destaque': 'Destacado',
    'widget.badge.essencial': 'Esencial',
    'widget.badge.interativo': 'Interactivo',
    'widget.badge.popular': 'Popular',
    'widget.badge.trending': 'Tendencias',

    'widget.catalog.header.name': 'Cabecera',
    'widget.catalog.header.desc': 'Nombre, usuario y badge de empresa',
    'widget.catalog.ascii-text.name': 'Texto ASCII',
    'widget.catalog.ascii-text.desc': 'Texto personalizado renderizado en fuente de arte ASCII',
    'widget.catalog.ascii-art.name': 'Arte ASCII',
    'widget.catalog.ascii-art.desc': 'Imagen convertida en arte de caracteres',
    'editor.ascii.text_title': 'Texto en ASCII',
    'editor.ascii.text_label': 'Texto Personalizado',
    'editor.ascii.font_label': 'Estilo de Fuente ASCII',
    'editor.ascii.charset_base_label': 'Conjunto de Caracteres (Base)',
    'editor.ascii.spacing_label': 'Espaciado de Letras',
    'editor.ascii.fontsize_label': 'Tamaño del Carácter',
    'editor.ascii.font.block': 'Bloque Sólido',
    'editor.ascii.font.slant': 'Slant Inclinado',
    'editor.ascii.font.thin': 'Línea Fina',
    'widget.catalog.terminal-info.name': 'Información de Terminal',
    'widget.catalog.terminal-info.desc': 'Tarjeta de información de terminal estilo Neofetch',
    'widget.catalog.avatar.name': 'Avatar',
    'widget.catalog.avatar.desc': 'Marco para foto de perfil',
    'widget.catalog.tech-stack.name': 'Habilidades',
    'widget.catalog.tech-stack.desc': 'Galería interactiva de iconos de habilidades',
    'widget.catalog.bio.name': 'Biografía y Enlaces',
    'widget.catalog.bio.desc': 'Biografía, ubicación y enlace de web',
    'widget.catalog.stats.name': 'Estadísticas GitHub',
    'widget.catalog.stats.desc': 'Métricas de estrellas, repos y seguidores',
    'widget.catalog.languages.name': 'Lenguajes Principales',
    'widget.catalog.languages.desc': 'Barra de distribución de lenguajes',
    'widget.catalog.repositories.name': 'Repos Destacados',
    'widget.catalog.repositories.desc': 'Tarjetas de repositorios destacados',
    'widget.catalog.social-media.name': 'Redes Sociales',
    'widget.catalog.social-media.desc': 'Escudos e insignias de redes sociales',
    'widget.catalog.github-readme-stats.name': 'Estadísticas GitHub (Readme Stats)',
    'widget.catalog.github-readme-stats.desc': 'Estadísticas, top lenguajes y repos fijados',
    'widget.catalog.streak-stats.name': 'Racha GitHub (Streak Stats)',
    'widget.catalog.streak-stats.desc': 'Racha y récord de contribuciones',
    'widget.catalog.profile-trophy.name': 'Trofeos GitHub (Profile Trophy)',
    'widget.catalog.profile-trophy.desc': 'Trofeos y logros del perfil',
    'widget.catalog.activity-graph.name': 'Gráfico de Actividad',
    'widget.catalog.activity-graph.desc': 'Gráfico de líneas de actividad en 31 días',
    'widget.catalog.contribution-snake.name': 'Serpiente de Historial',
    'widget.catalog.contribution-snake.desc': 'Serpiente animada comiendo bloques de commit',
    'widget.catalog.metrics-card.name': 'Tarjeta de Métricas',
    'widget.catalog.metrics-card.desc': 'Infografía avanzada de métricas y hábitos',
    'widget.catalog.views-counter.name': 'Contador de Visitas',
    'widget.catalog.views-counter.desc': 'Contador de visitas al perfil de GitHub',
    'widget.catalog.readme-quotes.name': 'Citas de GitHub',
    'widget.catalog.readme-quotes.desc': 'Cita diaria para desarrolladores',
    'widget.catalog.awesome-badge.name': 'Badge Destacado',
    'widget.catalog.awesome-badge.desc': 'Badge de destaque para perfiles increíbles',
    'widget.catalog.divider.name': 'Divisor Neon',
    'widget.catalog.divider.desc': 'Línea de separación de secciones',
    'widget.catalog.footer.name': 'Sello de Pie',
    'widget.catalog.footer.desc': 'Pie de metadatos con firma',
  },
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gitascii_lang') as Language
      if (saved && (saved === 'en' || saved === 'pt' || saved === 'es')) {
        setLanguageState(saved)
      } else {
        const navLang = navigator.language.split('-')[0]
        if (navLang === 'pt' || navLang === 'br') {
          setLanguageState('pt')
        } else if (navLang === 'es') {
          setLanguageState('es')
        } else {
          setLanguageState('en')
        }
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('gitascii_lang', lang)
      document.documentElement.lang = lang
    }
  }

  const t = (key: string, defaultValue?: string, variables?: Record<string, string>): string => {
    const translationSet = translations[language] || translations['en']
    let value = translationSet[key]

    if (value === undefined) {
      value = translations['en'][key]
    }

    if (value === undefined) {
      value = defaultValue !== undefined ? defaultValue : key
    }

    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), v)
      })
    }

    return value
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>{children}</I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
