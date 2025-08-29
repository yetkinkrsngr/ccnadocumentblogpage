import Prism from 'prismjs'

// Basit Cisco CLI söz dizimi vurgulama
Prism.languages.cisco = {
  'comment': /!.*/,
  'keyword': /\b(?:enable|configure terminal|interface|ip|route|show|vlan|name|exit|end|write|memory|switchport|mode|trunk|allowed|access|encapsulation|router|ospf|eigrp|gigabitethernet|fastethernet|description|no|shutdown)\b/i,
  'boolean': /\b(?:on|off|yes|no)\b/i,
  'number': /\b\d+(?:\.\d+){0,3}\b/,
  'ip': /\b\d{1,3}(?:\.\d{1,3}){3}\b/,
  'interface': /\b(?:GigabitEthernet|FastEthernet|Serial)\d+(?:\/\d+)*\b/,
  'string': {
    pattern: /".*?"|'.*?'/,
    greedy: true
  },
  'operator': /[=:]/,
  'punctuation': /[{}();,]/
}

