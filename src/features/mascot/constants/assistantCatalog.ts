import type { AssistantAction, AssistantTip, TipId } from '../assistant/types'
import { ASSISTANT_ACTION } from './assistant'
import { STROBI_ACCESSORY, STROBI_MOOD } from './strobi'

// English is the fallback for locales without an assistant translation yet.
export const ASSISTANT_TIPS = {
  bio: {
    title: ['Give your intro a point of view.', 'Sua apresentação merece personalidade.'],
    body: [
      'Say what you build, who it helps and what you’re exploring now. Three useful lines beat “passionate about technology” on repeat.',
      'Conte o que você cria, quem isso ajuda e o que está explorando agora. Três linhas úteis ganham de “apaixonado por tecnologia” em loop.',
    ],
    action: ASSISTANT_ACTION.PROPERTIES,
    mood: STROBI_MOOD.THINKING,
    accessory: STROBI_ACCESSORY.PROFESSOR,
  },
  repositories: {
    title: ['Let the projects do the talking.', 'Deixe os projetos falarem.'],
    body: [
      'Highlight a few projects with clear descriptions. A visitor should understand the problem you solved before opening the repository.',
      'Destaque alguns projetos com descrições claras. Quem visita deve entender o problema que você resolveu antes de abrir o repositório.',
    ],
    action: ASSISTANT_ACTION.PROPERTIES,
    mood: STROBI_MOOD.FOCUSED,
    accessory: STROBI_ACCESSORY.DEVELOPER,
  },
  tech: {
    title: ['A stack, not a shopping list.', 'Uma stack, não uma lista de compras.'],
    body: [
      'Keep the technologies you actually use near the top. A focused stack is easier to scan than a museum of every tool you’ve tried.',
      'Dê destaque às tecnologias que você realmente usa. Uma stack focada é mais fácil de ler que um museu de toda ferramenta que você já testou.',
    ],
    action: ASSISTANT_ACTION.PROPERTIES,
    mood: STROBI_MOOD.PLAYFUL,
    accessory: STROBI_ACCESSORY.DEVELOPER,
  },
  social: {
    title: ['Make the next hello easy.', 'Facilite o próximo oi.'],
    body: [
      'Include the places where you want people to reach you, and check the links before publishing. A beautiful dead end is still a dead end.',
      'Inclua os canais em que você quer receber contato e confira os links antes de publicar. Um beco sem saída bonito ainda é um beco sem saída.',
    ],
    action: ASSISTANT_ACTION.PROPERTIES,
    mood: STROBI_MOOD.CURIOUS,
    accessory: STROBI_ACCESSORY.DETECTIVE,
  },
  ascii: {
    title: ['A portrait made of characters.', 'Um retrato feito de caracteres.'],
    body: [
      'Simple shapes and strong contrast survive ASCII conversion best. Check the result at profile size; tiny details tend to take the day off.',
      'Formas simples e contraste forte funcionam melhor em ASCII. Confira no tamanho do perfil: detalhes minúsculos costumam tirar folga.',
    ],
    action: ASSISTANT_ACTION.PREVIEW,
    mood: STROBI_MOOD.HAPPY,
    accessory: STROBI_ACCESSORY.ARTIST,
  },
  library: {
    title: ['Give the next widget a job.', 'Dê uma missão ao próximo widget.'],
    body: [
      'Need an introduction, a project showcase or a way to get in touch? Pick the widget for that job. Collecting all of them is optional.',
      'Falta uma apresentação, uma vitrine de projetos ou um contato? Escolha o widget para essa função. Completar a coleção é opcional.',
    ],
    action: ASSISTANT_ACTION.WIDGETS,
    mood: STROBI_MOOD.CURIOUS,
    accessory: STROBI_ACCESSORY.PROFESSOR,
  },
  welcome: {
    title: ['Your README, with a co-pilot.', 'Seu README ganhou um copiloto.'],
    body: [
      'I’m Strobi. Pick a starting point and I’ll help with the details. Creative direction is still yours.',
      'Sou o Strobi. Escolha um ponto de partida e eu ajudo nos detalhes. A direção criativa continua sendo sua.',
    ],
    action: ASSISTANT_ACTION.TEMPLATES,
    mood: STROBI_MOOD.WAVING,
    accessory: STROBI_ACCESSORY.DEVELOPER,
  },
  empty: {
    title: ['A blank canvas. Excellent.', 'Tela em branco. Excelente.'],
    body: [
      'Start with a bio or header so visitors know who you are. We can fit the rest of the universe in later.',
      'Comece com uma bio ou cabeçalho para dizer quem você é. O resto do universo a gente encaixa depois.',
    ],
    action: ASSISTANT_ACTION.WIDGETS,
    mood: STROBI_MOOD.CURIOUS,
    accessory: STROBI_ACCESSORY.DEVELOPER,
  },
  added: {
    title: ['A new piece of you.', 'Mais uma peça do seu perfil.'],
    body: [
      'Your widget is on the canvas. Select it to adjust its content, size and position in Properties.',
      'Seu widget já está no canvas. Selecione-o para ajustar conteúdo, tamanho e posição em Propriedades.',
    ],
    action: ASSISTANT_ACTION.PROPERTIES,
    mood: STROBI_MOOD.HAPPY,
    accessory: STROBI_ACCESSORY.ARTIST,
  },
  selected: {
    title: ['The details live here.', 'O capricho mora aqui.'],
    body: [
      'Properties adapts to the selected widget. Try a short, specific description: what you build beats a wall of buzzwords.',
      'Propriedades se adapta ao widget selecionado. Uma descrição curta do que você cria vale mais que uma parede de buzzwords.',
    ],
    action: ASSISTANT_ACTION.PROPERTIES,
    mood: STROBI_MOOD.FOCUSED,
    accessory: STROBI_ACCESSORY.PROFESSOR,
  },
  multi: {
    title: ['Teamwork, pixel edition.', 'Trabalho em equipe, versão pixel.'],
    body: [
      'You selected several widgets. Use the alignment and distribution controls to give them consistent spacing.',
      'Você selecionou vários widgets. Use os controles de alinhamento e distribuição para deixar o espaçamento consistente.',
    ],
    action: ASSISTANT_ACTION.PROPERTIES,
    mood: STROBI_MOOD.FOCUSED,
    accessory: STROBI_ACCESSORY.PROFESSOR,
  },
  locked: {
    title: ['This one is staying put.', 'Este aqui está de plantão.'],
    body: [
      'This widget is locked. Unlock it in Properties before trying to move or resize it.',
      'Este widget está bloqueado. Desbloqueie em Propriedades antes de mover ou redimensionar.',
    ],
    action: ASSISTANT_ACTION.PROPERTIES,
    mood: STROBI_MOOD.THINKING,
    accessory: STROBI_ACCESSORY.DETECTIVE,
  },
  styles: {
    title: ['A little color discipline.', 'Uma pitada de direção de arte.'],
    body: [
      'Choose one accent color and keep body text easy to read. Your README needs a personality, not every color in the terminal.',
      'Escolha uma cor de destaque e mantenha o texto legível. Seu README precisa de personalidade, não de todas as cores do terminal.',
    ],
    action: ASSISTANT_ACTION.STYLES,
    mood: STROBI_MOOD.CURIOUS,
    accessory: STROBI_ACCESSORY.ARTIST,
  },
  templates: {
    title: ['A starting point, not a uniform.', 'Ponto de partida, não uniforme.'],
    body: [
      'Templates set the layout; you give it a voice. Applying one replaces the current composition. Undo is there if you change your mind.',
      'Templates montam o layout; você dá a personalidade. Aplicar um substitui a composição atual. O Desfazer ajuda se mudar de ideia.',
    ],
    action: ASSISTANT_ACTION.TEMPLATES,
    mood: STROBI_MOOD.THINKING,
    accessory: STROBI_ACCESSORY.ARTIST,
  },
  templateApplied: {
    title: ['New layout, same developer.', 'Layout novo, dev de sempre.'],
    body: [
      'Now make this template yours: adjust the bio, pick an accent color and remove anything that doesn’t tell your story.',
      'Agora deixe o template com a sua cara: ajuste a bio, escolha uma cor e remova o que não conta sua história.',
    ],
    action: ASSISTANT_ACTION.STYLES,
    mood: STROBI_MOOD.HAPPY,
    accessory: STROBI_ACCESSORY.ARTIST,
  },
  removed: {
    title: ['Room to breathe.', 'Espaço para respirar.'],
    body: [
      'Less can be more. Removed the wrong widget? Undo brings it back, no archaeological expedition required.',
      'Menos pode ser mais. Removeu o widget errado? Desfazer traz de volta, sem expedição arqueológica.',
    ],
    action: ASSISTANT_ACTION.UNDO,
    mood: STROBI_MOOD.THINKING,
    accessory: STROBI_ACCESSORY.DEVELOPER,
  },
  preview: {
    title: ['Time for a dress rehearsal.', 'Hora do ensaio geral.'],
    body: [
      'GitHub Mode shows your composition in profile proportions. Check readability and spacing before publishing.',
      'O modo GitHub mostra a composição nas proporções do perfil. Confira a leitura e os espaços antes de publicar.',
    ],
    action: ASSISTANT_ACTION.PREVIEW,
    mood: STROBI_MOOD.FOCUSED,
    accessory: STROBI_ACCESSORY.DETECTIVE,
  },
  previewing: {
    title: ['A visitor’s-eye view.', 'Pelos olhos de quem visita.'],
    body: [
      'Can someone tell what you build at a glance? Give your bio and strongest projects room to stand out.',
      'Dá para entender o que você cria logo de cara? Dê espaço para a bio e seus melhores projetos aparecerem.',
    ],
    action: ASSISTANT_ACTION.EXPORT,
    mood: STROBI_MOOD.CURIOUS,
    accessory: STROBI_ACCESSORY.DETECTIVE,
  },
  crowded: {
    title: ['Your pixels need elbow room.', 'Seus pixels pediram espaço.'],
    body: [
      'There’s a lot on this canvas. Give each section a job: introduction, projects, activity. Remove repeated information and preview the result.',
      'Tem bastante coisa no canvas. Dê uma função a cada seção: apresentação, projetos, atividade. Evite repetir informação e confira a prévia.',
    ],
    action: ASSISTANT_ACTION.PREVIEW,
    mood: STROBI_MOOD.THINKING,
    accessory: STROBI_ACCESSORY.ARTIST,
  },
  export: {
    title: ['Ready for the outside world?', 'Pronto para sair do editor?'],
    body: [
      'Preview first, then use Update README to publish to your connected GitHub account. The export guide also explains the manual route.',
      'Confira a prévia e use Atualizar README para publicar na conta GitHub conectada. O guia de exportação também explica o caminho manual.',
    ],
    action: ASSISTANT_ACTION.EXPORT,
    mood: STROBI_MOOD.PROUD,
    accessory: STROBI_ACCESSORY.ASTRONAUT,
  },
  published: {
    title: ['Your README has left the building.', 'Seu README ganhou o mundo.'],
    body: [
      'GitHub confirmed the publication. The SVG files live in your repository; its Action handles scheduled refreshes. I’ll allow myself a tiny victory dance.',
      'O GitHub confirmou a publicação. Os SVGs ficam no seu repositório; a Action cuida das atualizações agendadas. Me permita uma dancinha de vitória.',
    ],
    action: ASSISTANT_ACTION.PREVIEW,
    mood: STROBI_MOOD.CELEBRATING,
    accessory: STROBI_ACCESSORY.PARTY,
  },
  publishError: {
    title: ['Let’s get this published.', 'Vamos destravar a publicação.'],
    body: [
      'Publication failed. Your current layout is still in the editor. Check the account connection and try again, or open the manual export guide.',
      'A publicação falhou. Seu layout continua no editor. Confira a conexão da conta e tente novamente, ou abra o guia de exportação manual.',
    ],
    action: ASSISTANT_ACTION.EXPORT,
    mood: STROBI_MOOD.FOCUSED,
    accessory: STROBI_ACCESSORY.DEVELOPER,
  },
  copied: {
    title: ['One widget, a second act.', 'Um widget, uma segunda chance.'],
    body: [
      'Copied. Paste it on the canvas with Ctrl+V (⌘V on Mac), then change the content to avoid an accidental twin.',
      'Copiado. Cole no canvas com Ctrl+V (⌘V no Mac) e ajuste o conteúdo para evitar um gêmeo acidental.',
    ],
    mood: STROBI_MOOD.PLAYFUL,
    accessory: STROBI_ACCESSORY.DEVELOPER,
  },
  undo: {
    title: ['A perfectly valid creative decision.', 'Uma decisão criativa totalmente válida.'],
    body: [
      'Undone. Exploring is part of designing. Ctrl+Shift+Z (⌘⇧Z on Mac) redoes the last step.',
      'Desfeito. Experimentar faz parte. Ctrl+Shift+Z (⌘⇧Z no Mac) refaz o último passo.',
    ],
    mood: STROBI_MOOD.HAPPY,
    accessory: STROBI_ACCESSORY.DEVELOPER,
  },
  proWelcome: {
    title: ['I put on a tie for this.', 'Até coloquei gravata para isso.'],
    body: [
      'Pro adds profile management, analytics and publication monitoring. Tell me what you need and I’ll help you decide if it fits.',
      'O Pro reúne gestão de perfis, analytics e monitoramento de publicação. Me diga o que procura e eu ajudo a ver se faz sentido.',
    ],
    action: ASSISTANT_ACTION.COMPARE,
    mood: STROBI_MOOD.PLAYFUL,
    accessory: STROBI_ACCESSORY.BUSINESSMAN,
  },
  proAnalytics: {
    title: ['Less guessing. More signals.', 'Menos achismo. Mais sinais.'],
    body: [
      'Analytics helps you follow requests to your tracking badge. It’s a traffic signal, not an exact count of people. Even my detective hat has limits.',
      'Analytics ajuda a acompanhar requisições ao badge de rastreamento. É um sinal de tráfego, não uma contagem exata de pessoas. Até meu chapéu de detetive tem limites.',
    ],
    action: ASSISTANT_ACTION.COMPARE,
    mood: STROBI_MOOD.THINKING,
    accessory: STROBI_ACCESSORY.DETECTIVE,
  },
  proProfiles: {
    title: ['One developer. Several introductions.', 'Um dev. Várias apresentações.'],
    body: [
      'Separate profiles let you tailor your README for projects, events or sponsors. Different occasions, different outfits. Mine is apparently always green.',
      'Perfis separados deixam você adaptar o README para projetos, eventos ou apoiadores. Cada ocasião pede uma roupa. A minha aparentemente é sempre verde.',
    ],
    action: ASSISTANT_ACTION.COMPARE,
    mood: STROBI_MOOD.HAPPY,
    accessory: STROBI_ACCESSORY.BUSINESSMAN,
  },
  proHealth: {
    title: ['Give the refresh button a rest.', 'Dê férias para o botão atualizar.'],
    body: [
      'Publication health and error details help you investigate failed updates. Less checking by hand, more time for what you’re building.',
      'A saúde da publicação e os detalhes dos erros ajudam a investigar falhas nas atualizações. Menos conferência manual, mais tempo para criar.',
    ],
    action: ASSISTANT_ACTION.COMPARE,
    mood: STROBI_MOOD.FOCUSED,
    accessory: STROBI_ACCESSORY.DEVELOPER,
  },
  proPrice: {
    title: ['The tie is optional. Clarity isn’t.', 'A gravata é opcional. Clareza, não.'],
    body: [
      'The current offer is a one-time payment for lifetime access. Review the price and included features below. No motivational speech required.',
      'A oferta atual é de pagamento único para acesso vitalício. Confira o preço e os recursos incluídos na página. Sem palestra motivacional.',
    ],
    action: ASSISTANT_ACTION.PRICING,
    mood: STROBI_MOOD.PROUD,
    accessory: STROBI_ACCESSORY.BUSINESSMAN,
  },
  proFaq: {
    title: ['Questions before checkout? Good.', 'Dúvidas antes de comprar? Justo.'],
    body: [
      'Check the FAQ for payment and access details. The free editor is still a useful place to start; Pro makes sense when you need its extra tools.',
      'Confira as perguntas frequentes sobre pagamento e acesso. O editor gratuito já é um bom começo; o Pro faz sentido quando você precisa dessas ferramentas extras.',
    ],
    action: ASSISTANT_ACTION.FAQ,
    mood: STROBI_MOOD.CURIOUS,
    accessory: STROBI_ACCESSORY.PROFESSOR,
  },
  member: {
    title: ['Your control room is ready.', 'Sua central está pronta.'],
    body: [
      'Start with Profiles to manage your versions, then check publication health. I’ve retired the sales pitch. The tie can stay.',
      'Comece por Perfis para gerenciar suas versões e confira a saúde das publicações. Aposentei o discurso de vendas. A gravata pode ficar.',
    ],
    action: ASSISTANT_ACTION.PROFILES,
    mood: STROBI_MOOD.HAPPY,
    accessory: STROBI_ACCESSORY.DEVELOPER,
  },
  analytics: {
    title: ['Read the trend, not the tea leaves.', 'Leia a tendência, não a bola de cristal.'],
    body: [
      'Compare similar periods and remember that badge requests are a proxy for traffic. Caches and automated requests can affect the numbers.',
      'Compare períodos semelhantes e lembre que requisições ao badge são uma aproximação de tráfego. Cache e acessos automatizados podem afetar os números.',
    ],
    action: ASSISTANT_ACTION.ANALYTICS,
    mood: STROBI_MOOD.THINKING,
    accessory: STROBI_ACCESSORY.DETECTIVE,
  },
  profiles: {
    title: ['Give each profile a purpose.', 'Dê um propósito a cada perfil.'],
    body: [
      'Use clear names for each version and inspect it before publishing. “final-final-2” is a tradition we can gently retire.',
      'Use nomes claros para cada versão e revise antes de publicar. “final-final-2” é uma tradição que podemos aposentar com carinho.',
    ],
    action: ASSISTANT_ACTION.PROFILES,
    mood: STROBI_MOOD.PLAYFUL,
    accessory: STROBI_ACCESSORY.PROFESSOR,
  },
  health: {
    title: ['Follow the clues.', 'Siga as pistas.'],
    body: [
      'Check the last publication and the reported error before trying again. A successful earlier run doesn’t guarantee the latest one succeeded.',
      'Confira a última publicação e o erro informado antes de tentar novamente. Uma execução anterior bem-sucedida não garante que a última funcionou.',
    ],
    action: ASSISTANT_ACTION.HEALTH,
    mood: STROBI_MOOD.FOCUSED,
    accessory: STROBI_ACCESSORY.DETECTIVE,
  },
} satisfies Record<TipId, Omit<AssistantTip, 'id'>>

export const ASSISTANT_ACTION_LABELS: Record<AssistantAction, [string, string]> = {
  widgets: ['Explore widgets', 'Explorar widgets'],
  templates: ['Choose a template', 'Escolher template'],
  properties: ['Open properties', 'Abrir propriedades'],
  styles: ['Adjust colors & fonts', 'Ajustar cores e fontes'],
  preview: ['Preview on GitHub', 'Ver prévia no GitHub'],
  export: ['Export guide', 'Guia de exportação'],
  tour: ['Show me around', 'Me mostre o editor'],
  undo: ['Undo removal', 'Desfazer remoção'],
  pricing: ['See the offer', 'Ver a oferta'],
  compare: ['Compare Free and Pro', 'Comparar Free e Pro'],
  faq: ['Read the FAQ', 'Ver perguntas frequentes'],
  profiles: ['Manage profiles', 'Gerenciar perfis'],
  analytics: ['Open analytics', 'Abrir analytics'],
  health: ['Publication health', 'Saúde da publicação'],
}
