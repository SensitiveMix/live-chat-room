/**
 * Created by sunqi on 2016/6/3.
 */

module.exports=function(grunt){
    grunt.initConfig({
        pkg:grunt.file.readJSON('package.json'),

        //js查错
        jshint:{
                build:['Gruntfile.js'],
                options:{
                     jshintrc:'.jshintsrc'
                   }
                },

        //js压缩
        uglify:{
            options:{
                stripBanners:true,
                banner:'/*!<%=pkg.name%>-<%=pkg.version%>.js <%=grunt.template.today("yyyy-mm-dd")%>*/\n'
            },

            my_target: {
                  files: [{
                      expand: true,
                      cwd: 'public/js',
                      src: ['*.js','!*.min.js'],
                      dest: 'public/js/min',
                      ext: '.js'

                  }]
               }
        },

        //css压缩
        cssmin: {
                  options: {
                    shorthandCompacting: false,
                    roundingPrecision: -1
                  },
                    target: {
                      files: [{
                         expand: true,
                         cwd: 'public/stylesheets/',
                         src: ['*.css','!*.min.css','!umeditor.css'],
                         dest: 'public/stylesheets/min',
                         ext: '.css'
                      }]
                    }
                },

        //添加监视
        watch:{
            build:{
                files:['public/js/*.js','public/stylesheets/*.css'],
                tasks:['jshint','uglify'],
                options:{spawn:false}
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default',['jshint','uglify','cssmin','watch']);
};