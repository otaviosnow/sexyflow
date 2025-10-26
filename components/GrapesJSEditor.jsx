'use client'

import { useEffect, useRef } from 'react'

export default function GrapesJSEditor({ initialHtml = '', initialCss = '', initialGjsData = {}, onSave }) {
  const editorRef = useRef(null)
  const editorInstanceRef = useRef(null)

  useEffect(() => {
    // Carregar CSS do GrapesJS
    if (typeof window !== 'undefined' && !document.getElementById('grapesjs-css')) {
      const link1 = document.createElement('link')
      link1.id = 'grapesjs-css'
      link1.rel = 'stylesheet'
      link1.href = 'https://unpkg.com/grapesjs/dist/css/grapes.min.css'
      document.head.appendChild(link1)

      const link2 = document.createElement('link')
      link2.rel = 'stylesheet'
      link2.href = 'https://unpkg.com/grapesjs-preset-webpage/dist/grapesjs-preset-webpage.min.css'
      document.head.appendChild(link2)
    }

    // Importar GrapesJS apenas no cliente
    if (typeof window !== 'undefined' && editorRef.current && !editorInstanceRef.current) {
      import('grapesjs').then((grapesjs) => {
        import('grapesjs-preset-webpage').then((presetWebpage) => {
          const editor = grapesjs.default.init({
            container: editorRef.current,
            height: '100%',
            width: 'auto',
            storageManager: false,
            plugins: [presetWebpage.default],
            pluginsOpts: {
              [presetWebpage.default]: {}
            },
            canvas: {
              styles: [],
              scripts: []
            },
            blockManager: {
              appendTo: '#blocks',
              blocks: [
                {
                  id: 'section',
                  label: '<div>Seção</div>',
                  attributes: { class: 'gjs-block-section' },
                  content: '<section style="padding: 40px 20px; min-height: 200px;"><div class="container"></div></section>'
                },
                {
                  id: 'text',
                  label: 'Texto',
                  content: '<div style="padding: 10px;">Insira seu texto aqui</div>'
                },
                {
                  id: 'image',
                  label: 'Imagem',
                  select: true,
                  content: { type: 'image' },
                  activate: true
                },
                {
                  id: 'video',
                  label: 'Vídeo',
                  content: {
                    type: 'video',
                    src: 'https://www.youtube.com/embed/jNQXAC9IVRw',
                    style: { height: '350px', width: '100%' }
                  }
                },
                {
                  id: 'button',
                  label: 'Botão',
                  content: '<a href="#" style="display: inline-block; padding: 12px 24px; background-color: #E9498B; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">Clique Aqui</a>'
                },
                {
                  id: 'spacer',
                  label: 'Espaçador',
                  content: '<div style="height: 50px;"></div>'
                },
                {
                  id: 'html',
                  label: 'HTML',
                  content: '<div>Código HTML customizado</div>',
                  attributes: { class: 'fa fa-code' }
                }
              ]
            },
            layerManager: {
              appendTo: '#layers'
            },
            styleManager: {
              appendTo: '#styles',
              sectors: [
                {
                  name: 'Dimensões',
                  open: false,
                  buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding']
                },
                {
                  name: 'Tipografia',
                  open: false,
                  buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align']
                },
                {
                  name: 'Decorações',
                  open: false,
                  buildProps: ['background-color', 'border-radius', 'border', 'box-shadow', 'background']
                },
                {
                  name: 'Extra',
                  open: false,
                  buildProps: ['transition', 'perspective', 'transform']
                }
              ]
            },
            traitManager: {
              appendTo: '#traits'
            }
          })

          // Carregar conteúdo inicial
          if (initialGjsData && Object.keys(initialGjsData).length > 0) {
            editor.loadProjectData(initialGjsData)
          } else if (initialHtml) {
            editor.setComponents(initialHtml)
            editor.setStyle(initialCss)
          }

          // Salvar referência
          editorInstanceRef.current = editor

          // Listener para salvar
          if (onSave) {
            editor.on('storage:store', () => {
              const html = editor.getHtml()
              const css = editor.getCss()
              const gjsData = editor.getProjectData()
              onSave({ html, css, gjsData })
            })
          }
        })
      })
    }

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy()
        editorInstanceRef.current = null
      }
    }
  }, [])

  // Função para salvar manualmente
  const handleSave = () => {
    if (editorInstanceRef.current && onSave) {
      const html = editorInstanceRef.current.getHtml()
      const css = editorInstanceRef.current.getCss()
      const gjsData = editorInstanceRef.current.getProjectData()
      onSave({ html, css, gjsData })
    }
  }

  // Expor função de salvar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.saveGrapesJS = handleSave
    }
  }, [])

  return (
    <div className="gjs-editor-wrapper" style={{ height: '100%', display: 'flex' }}>
      <div id="gjs" ref={editorRef} style={{ flex: 1 }}></div>
      
      <style jsx global>{`
        .gjs-editor-wrapper {
          position: relative;
        }
        
        #gjs {
          border: none;
        }
        
        .gjs-cv-canvas {
          background-color: #f5f5f5;
        }
        
        .gjs-block {
          width: auto;
          height: auto;
          min-height: 50px;
          padding: 10px;
        }
        
        .gjs-block-label {
          font-size: 12px;
        }
      `}</style>
    </div>
  )
}

